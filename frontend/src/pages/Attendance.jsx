import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { attendanceService, userService } from '../services/api';

export default function Attendance() {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isHR = currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'Manager';
  const isEmployee = currentUser?.role === 'Employee';

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Filters
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Manual Attendance Modal for HR
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedEmployee) params.employeeId = selectedEmployee;

      const res = await attendanceService.getAttendance(params);
      setAttendanceRecords(res.data.attendance || []);

      if (isHR || isManager) {
        const usersRes = await userService.getUsers();
        setEmployeesList(usersRes.data.users || []);
      }
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load attendance records',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedEmployee]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(
    (r) =>
      (r.employee?._id || r.employee) === currentUser?._id &&
      r.date === todayStr
  );

  const handleMarkAttendance = async () => {
    try {
      setActionLoading(true);
      const res = await attendanceService.markAttendance({});
      setNotification({
        type: 'success',
        message: res.data.message || 'Attendance status updated!',
      });
      fetchAttendance();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to record attendance',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await attendanceService.markAttendance(manualForm);
      setNotification({
        type: 'success',
        message: 'Attendance logged successfully',
      });
      setShowManualModal(false);
      fetchAttendance();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to log attendance',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return 'badge-status-present';
      case 'Late':
        return 'badge-status-late';
      case 'Half Day':
        return 'badge-status-halfday';
      case 'Absent':
        return 'badge-status-absent';
      default:
        return 'badge-status-present';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Attendance Management</h3>
          <p className="text-secondary small mb-0">
            {isHR
              ? 'Real-time organizational attendance records, check-ins, and shift compliance'
              : isManager
              ? `Team attendance roster for ${currentUser?.department} Department`
              : 'Log daily check-ins and review your attendance log'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {isHR && (
            <button
              onClick={() => setShowManualModal(true)}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            >
              <i className="bi bi-calendar-plus"></i>
              <span>Manual Entry</span>
            </button>
          )}
          <button
            onClick={handleMarkAttendance}
            disabled={actionLoading || (todayRecord && todayRecord.checkOut)}
            className={`btn ${
              !todayRecord
                ? 'btn-success'
                : !todayRecord.checkOut
                ? 'btn-warning text-dark'
                : 'btn-outline-secondary'
            } btn-sm px-3 d-flex align-items-center gap-2`}
          >
            <i className="bi bi-fingerprint fs-6"></i>
            <span>
              {!todayRecord
                ? 'Mark Attendance (Check In)'
                : !todayRecord.checkOut
                ? 'Check Out Now'
                : 'Attendance Done Today'}
            </span>
          </button>
        </div>
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      {/* Today's Attendance Highlight Card */}
      <div className="card-clean p-4 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-7">
            <span className="stat-label">Today's Attendance Status</span>
            <div className="d-flex align-items-center gap-3 mt-2">
              {todayRecord ? (
                <>
                  <span className={`badge rounded-pill px-3 py-1 fs-6 ${getStatusBadge(todayRecord.status)}`}>
                    {todayRecord.status}
                  </span>
                  <div className="d-flex align-items-center gap-3 text-secondary small">
                    <div>
                      Check In: <strong className="font-mono text-dark">{todayRecord.checkIn || '--'}</strong>
                    </div>
                    <span>·</span>
                    <div>
                      Check Out: <strong className="font-mono text-dark">{todayRecord.checkOut || 'Active Shift'}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge badge-status-absent px-3 py-1 fs-6">Not Clocked In</span>
                  <span className="text-muted small">You haven't recorded attendance for today yet.</span>
                </div>
              )}
            </div>
          </div>
          <div className="col-md-5 text-md-end">
            <span className="text-secondary small font-mono">
              Date: <strong className="text-dark">{todayStr}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for HR/Managers */}
      {(isHR || isManager) && (
        <div className="card-clean p-3 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-secondary mb-1">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control form-control-sm"
              />
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-secondary mb-1">Filter by Staff Member</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">All Personnel</option>
                {employeesList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-md-end mt-md-4">
              <button
                onClick={() => {
                  setSelectedDate('');
                  setSelectedEmployee('');
                }}
                className="btn btn-light btn-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="card-clean overflow-hidden">
        <div className="card-header-clean">
          <div>
            <h6 className="fw-bold mb-0 text-dark">Attendance Records History</h6>
            <small className="text-secondary">Chronological check-in and checkout audit</small>
          </div>
          <span className="font-mono text-secondary small tabular-nums">
            {attendanceRecords.length} entries
          </span>
        </div>

        {loading ? (
          <Loading message="Loading attendance logs..." />
        ) : attendanceRecords.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-clock-history fs-1 d-block mb-2 opacity-50"></i>
            <h6>No attendance records found</h6>
            <p className="small mb-0">No logs match the current search filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-clean mb-0 align-middle">
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Work Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((att) => (
                  <tr key={att._id}>
                    {!isEmployee && (
                      <td>
                        <div className="fw-semibold text-dark">
                          {att.employee?.name || 'Staff Member'}
                        </div>
                        <small className="text-muted">{att.employee?.department}</small>
                      </td>
                    )}
                    <td>
                      <span className="font-mono small text-dark">{att.date}</span>
                    </td>
                    <td>
                      <span className="font-mono small text-secondary">{att.checkIn || '--'}</span>
                    </td>
                    <td>
                      <span className="font-mono small text-secondary">{att.checkOut || '--'}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 small ${getStatusBadge(att.status)}`}>
                        {att.status}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono small text-secondary">{att.workHours || '8 hrs'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">Log Manual Attendance Entry</h5>
                <button type="button" className="btn-close" onClick={() => setShowManualModal(false)}></button>
              </div>

              <form onSubmit={handleManualSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Employee *</label>
                    <select
                      required
                      value={manualForm.employeeId}
                      onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Select Employee...</option>
                      {employeesList.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.name} ({e.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={manualForm.date}
                      onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">Status</label>
                    <select
                      value={manualForm.status}
                      onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowManualModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary-custom">
                    {actionLoading ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
