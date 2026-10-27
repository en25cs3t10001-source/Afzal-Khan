import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { leaveService } from '../services/api';

export default function Leaves() {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isHR = currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'Manager';
  const isEmployee = currentUser?.role === 'Employee';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Review (Approve/Reject) Modal for HR/Manager
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [adminComment, setAdminComment] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveService.getLeaves();
      setLeaves(res.data.leaves || []);
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch leave requests',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (new Date(applyForm.startDate) > new Date(applyForm.endDate)) {
      setNotification({
        type: 'danger',
        message: 'Start date cannot be after end date',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await leaveService.applyLeave(applyForm);
      setNotification({
        type: 'success',
        message: res.data.message || 'Leave applied successfully!',
      });
      setShowApplyModal(false);
      setApplyForm({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to submit leave',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    }
  };

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setAdminComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmitting(true);
    try {
      const res = await leaveService.updateLeaveStatus(selectedLeave._id, {
        status: reviewAction,
        adminComment,
      });
      setNotification({
        type: 'success',
        message: res.data.message || `Leave marked as ${reviewAction}`,
      });
      setShowReviewModal(false);
      fetchLeaves();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update leave',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }
    try {
      await leaveService.deleteLeave(id);
      setNotification({
        type: 'success',
        message: 'Leave request cancelled successfully',
      });
      fetchLeaves();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel leave',
      });
    } finally {
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const filteredLeaves = leaves.filter((item) => {
    if (activeTab === 'All') return true;
    return item.status === activeTab;
  });

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'badge-status-approved';
    if (status === 'Rejected') return 'badge-status-rejected';
    return 'badge-status-pending';
  };

  // Leave balance summary for employee
  const casualUsed = leaves.filter((l) => l.leaveType === 'Casual Leave' && l.status === 'Approved').length;
  const sickUsed = leaves.filter((l) => l.leaveType === 'Sick Leave' && l.status === 'Approved').length;
  const annualUsed = leaves.filter((l) => l.leaveType === 'Annual Leave' && l.status === 'Approved').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Leave Management</h3>
          <p className="text-secondary small mb-0">
            {isHR
              ? 'Review and manage all employee leave requests organization-wide'
              : isManager
              ? `Review and manage team leave requests for the ${currentUser?.department} Department`
              : 'Apply for leaves and track real-time approval status'}
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn btn-primary-custom d-flex align-items-center gap-2"
        >
          <i className="bi bi-calendar-plus"></i>
          <span>Apply for Leave</span>
        </button>
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      {/* Leave Balance Counters for Employee */}
      {isEmployee && (
        <div className="row g-3 mb-4">
          <div className="col-sm-4">
            <div className="card-clean p-3 bg-white">
              <div className="text-secondary small fw-semibold">Casual Leave Balance</div>
              <div className="h4 fw-bold tabular-nums text-primary mb-0 mt-1">
                {12 - casualUsed} <span className="fs-6 fw-normal text-muted">/ 12 days left</span>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card-clean p-3 bg-white">
              <div className="text-secondary small fw-semibold">Sick Leave Balance</div>
              <div className="h4 fw-bold tabular-nums text-success mb-0 mt-1">
                {10 - sickUsed} <span className="fs-6 fw-normal text-muted">/ 10 days left</span>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card-clean p-3 bg-white">
              <div className="text-secondary small fw-semibold">Annual Leave Balance</div>
              <div className="h4 fw-bold tabular-nums text-info mb-0 mt-1">
                {18 - annualUsed} <span className="fs-6 fw-normal text-muted">/ 18 days left</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="btn-group btn-group-sm" role="group">
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`btn ${
                activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'
              }`}
            >
              {tab} (
              {tab === 'All'
                ? leaves.length
                : leaves.filter((l) => l.status === tab).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card-clean overflow-hidden">
        {loading ? (
          <Loading message="Loading leave applications..." />
        ) : filteredLeaves.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
            <h6>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} leaves found</h6>
            <p className="small mb-0">No records match the current filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-clean mb-0 align-middle">
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => {
                  const s = new Date(leave.startDate);
                  const e = new Date(leave.endDate);
                  const diffTime = Math.abs(e - s);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave._id}>
                      {!isEmployee && (
                        <td>
                          <div className="fw-semibold text-dark">
                            {leave.employee?.name || 'Staff Member'}
                          </div>
                          <small className="text-muted">{leave.employee?.department}</small>
                        </td>
                      )}
                      <td>
                        <span className="fw-medium text-dark">{leave.leaveType}</span>
                      </td>
                      <td>
                        <div className="small tabular-nums text-secondary">
                          {s.toLocaleDateString()} – {e.toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono small text-secondary">{diffDays} day{diffDays > 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        <div className="small text-secondary text-truncate" style={{ maxWidth: '220px' }}>
                          {leave.reason}
                        </div>
                        {leave.adminComment && (
                          <div className="small text-muted fst-italic" style={{ fontSize: '0.72rem' }}>
                            Remark: {leave.adminComment}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-2 py-1 small ${getStatusBadge(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted tabular-nums">
                          {new Date(leave.appliedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-end">
                        {(isHR || isManager) && leave.status === 'Pending' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => openReviewModal(leave, 'Approved')}
                              className="btn btn-outline-success"
                              title="Approve"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              onClick={() => openReviewModal(leave, 'Rejected')}
                              className="btn btn-outline-danger"
                              title="Reject"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        ) : isEmployee && leave.status === 'Pending' ? (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="btn btn-outline-danger btn-sm"
                            title="Cancel Application"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-muted small">
                            {leave.approvedBy ? `Reviewed` : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">Submit Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Leave Category *
                    </label>
                    <select
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                      className="form-select"
                      required
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={applyForm.endDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Reason for Absence *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                      className="form-control"
                      placeholder="Please specify context or details regarding your leave..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom">
                    {submitting ? 'Submitting...' : 'Submit Leave Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for HR/Manager */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">
                  {reviewAction === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="fw-semibold text-dark">{selectedLeave.employee?.name}</div>
                    <div className="small text-muted">{selectedLeave.leaveType} · {selectedLeave.employee?.department}</div>
                    <div className="small text-secondary mt-2 fst-italic">"{selectedLeave.reason}"</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Decision
                    </label>
                    <select
                      value={reviewAction}
                      onChange={(e) => setReviewAction(e.target.value)}
                      className="form-select"
                    >
                      <option value="Approved">Approve Application</option>
                      <option value="Rejected">Reject Application</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Administrative Comments / Reason
                    </label>
                    <textarea
                      rows={2}
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Add an optional comment for the employee..."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                  >
                    {submitting ? 'Processing...' : `Confirm ${reviewAction}`}
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
