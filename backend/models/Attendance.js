import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attendance must belong to an employee'],
    },
    date: {
      type: String, // Format: YYYY-MM-DD for reliable day indexing and grouping
      required: [true, 'Attendance date is required'],
    },
    checkIn: {
      type: String, // e.g. "09:15 AM"
      default: '',
    },
    checkOut: {
      type: String, // e.g. "05:45 PM"
      default: '',
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day'],
      default: 'Present',
    },
    workHours: {
      type: String,
      default: '8 hrs',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
