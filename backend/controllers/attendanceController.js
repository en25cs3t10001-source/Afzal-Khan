import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Format current time into human readable format like "09:30 AM"
const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format date into YYYY-MM-DD
const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    if (req.user.role === 'HR') {
      // HR can view all attendance
    } else if (req.user.role === 'Manager') {
      // Manager views attendance for team members in department
      const deptUsers = await User.find({ department: req.user.department }).select('_id');
      const userIds = deptUsers.map((u) => u._id);
      query.employee = { $in: userIds };
    } else {
      // Employee views only their own attendance
      query.employee = req.user._id;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'name email department role profileImage')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error('[GetAttendance Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
    });
  }
};

// @desc    Mark attendance (Check-in or Check-out)
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const targetEmployeeId = (req.user.role === 'HR' && req.body.employeeId)
      ? req.body.employeeId
      : req.user._id;

    const todayDate = req.body.date || formatDate();
    const now = new Date();
    const currentTimeStr = formatTime(now);

    // Look for existing attendance record for today
    let record = await Attendance.findOne({
      employee: targetEmployeeId,
      date: todayDate,
    });

    if (!record) {
      // First action of the day: Check In
      // Check if after 09:30 AM for Late status
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      let status = req.body.status || 'Present';

      // Automatic check for late status if marking for today and after 9:30 AM
      if (!req.body.status && (currentHours > 9 || (currentHours === 9 && currentMinutes > 30))) {
        status = 'Late';
      }

      record = await Attendance.create({
        employee: targetEmployeeId,
        date: todayDate,
        checkIn: currentTimeStr,
        checkOut: '',
        status,
        workHours: 'In Progress',
      });

      const populated = await Attendance.findById(record._id)
        .populate('employee', 'name email department role profileImage');

      return res.status(201).json({
        success: true,
        message: `Checked in successfully at ${currentTimeStr}. Status: ${status}`,
        record: populated,
      });
    } else {
      // Record already exists for today
      // If action is checkout:
      if (!record.checkOut) {
        record.checkOut = currentTimeStr;
        record.workHours = '8.0 hrs';
        if (req.body.status) {
          record.status = req.body.status;
        }
        await record.save();

        const populated = await Attendance.findById(record._id)
          .populate('employee', 'name email department role profileImage');

        return res.status(200).json({
          success: true,
          message: `Checked out successfully at ${currentTimeStr}`,
          record: populated,
        });
      } else {
        // Both checkIn and checkOut already done
        if (req.user.role === 'HR' && req.body.status) {
          // HR can update status
          record.status = req.body.status;
          await record.save();
          return res.status(200).json({
            success: true,
            message: 'Attendance record updated',
            record,
          });
        }

        return res.status(400).json({
          success: false,
          message: `Attendance for today (${todayDate}) has already been recorded (In: ${record.checkIn}, Out: ${record.checkOut})`,
          record,
        });
      }
    }
  } catch (error) {
    console.error('[MarkAttendance Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record attendance',
    });
  }
};

// @desc    Get attendance history for a single employee
// @route   GET /api/attendance/:employeeId
// @access  Private
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check permissions
    if (
      req.user.role === 'Employee' &&
      req.user._id.toString() !== employeeId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Cannot view attendance records of other employees',
      });
    }

    const records = await Attendance.find({ employee: employeeId })
      .populate('employee', 'name email department role profileImage')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error('[GetEmployeeAttendance Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee attendance history',
    });
  }
};
