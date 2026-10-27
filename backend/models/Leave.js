import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Leave must be associated with an employee'],
    },
    leaveType: {
      type: String,
      required: [true, 'Please select a leave type'],
      enum: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide leave start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide leave end date'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave application'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminComment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
