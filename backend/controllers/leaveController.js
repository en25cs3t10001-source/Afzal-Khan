import Leave from '../models/Leave.js';
import User from '../models/User.js';

// @desc    Get leaves based on role
// @route   GET /api/leaves
// @access  Private
export const getLeaves = async (req, res) => {
  try {
    let leaves;

    if (req.user.role === 'HR') {
      // HR sees all leave requests
      leaves = await Leave.find()
        .populate('employee', 'name email department role profileImage')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Manager') {
      // Manager sees team leaves in their department plus their own
      const deptEmployees = await User.find({ department: req.user.department }).select('_id');
      const employeeIds = deptEmployees.map((e) => e._id);

      leaves = await Leave.find({ employee: { $in: employeeIds } })
        .populate('employee', 'name email department role profileImage')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      // Employee sees only their own leaves
      leaves = await Leave.find({ employee: req.user._id })
        .populate('employee', 'name email department role profileImage')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error('[GetLeaves Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
    });
  }
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Leave start date cannot be after end date',
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'name email department role profileImage');

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populatedLeave,
    });
  } catch (error) {
    console.error('[ApplyLeave Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit leave application',
    });
  }
};

// @desc    Update leave status (Approve or Reject)
// @route   PUT /api/leaves/:id
// @access  Private (HR, Manager)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Approved', 'Rejected', or 'Pending'",
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Role validation: Manager can only approve/reject leaves in their department
    if (req.user.role === 'Manager') {
      if (leave.employee.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          message: 'Managers can only approve or reject leaves for employees in their department',
        });
      }
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    if (adminComment !== undefined) {
      leave.adminComment = adminComment;
    }

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'name email department role profileImage')
      .populate('approvedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `Leave request marked as ${status}`,
      leave: updatedLeave,
    });
  } catch (error) {
    console.error('[UpdateLeaveStatus Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update leave status',
    });
  }
};

// @desc    Delete/Cancel leave application
// @route   DELETE /api/leaves/:id
// @access  Private
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave record not found',
      });
    }

    // Only owner of pending leave or HR can delete
    const isOwner = leave.employee.toString() === req.user._id.toString();
    const isHR = req.user.role === 'HR';

    if (!isHR && (!isOwner || leave.status !== 'Pending')) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pending leave requests',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Leave request deleted/cancelled successfully',
    });
  } catch (error) {
    console.error('[DeleteLeave Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
    });
  }
};
