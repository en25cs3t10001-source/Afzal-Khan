import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { userService, attendanceService, leaveService } from '../services/api';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userJson = localStorage.getItem('user');
  const loggedInUser = userJson ? JSON.parse(userJson) : null;

  // If no ID in URL, view self profile
  const targetId = id || loggedInUser?._id;
  const isSelf = loggedInUser?._id === targetId;
  const isHR = loggedInUser?.role === 'HR';

  const [userProfile, setUserProfile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    role: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userRes = await userService.getUserById(targetId);
      const profile = userRes.data.user;
      setUserProfile(profile);
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        role: profile.role || '',
        password: '',
      });

      // Fetch attendance and leaves for this user
      try {
        const attRes = await attendanceService.getEmployeeAttendance(targetId);
        setAttendanceRecords(attRes.data.attendance || []);
      } catch (e) {
        console.warn('Could not load attendance for profile');
      }

      try {
        const leavesRes = await leaveService.getLeaves();
        const userLeaves = (leavesRes.data.leaves || []).filter(
          (l) => (l.employee?._id || l.employee) === targetId
        );
        setLeavesList(userLeaves);
      } catch (e) {
        console.warn('Could not load leaves for profile');
      }
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch employee details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchProfileData();
    }
  }, [targetId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
      };

      if (isHR) {
        payload.department = formData.department;
        payload.role = formData.role;
      }

      if (formData.password && formData.password.trim().length >= 6) {
        payload.password = formData.password;
      }

      const res = await userService.updateUser(targetId, payload);
      setUserProfile(res.data.user);
      if (isSelf) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (!userProfile) {
    return (
      <div className="card-clean p-5 text-center">
        <h5>Employee record not found</h5>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm mt-3">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isSelf ? 'My Profile' : `${userProfile.name}'s Profile`}
          </h3>
          <p className="text-secondary small mb-0">
            {isSelf ? 'Manage your personal details and view employment record' : 'Administrative employee overview'}
          </p>
        </div>
        {(isSelf || isHR) && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          >
            <i className={`bi ${isEditing ? 'bi-x-lg' : 'bi-pencil'}`}></i>
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        )}
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card-clean p-4 text-center bg-white mb-4">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold mx-auto mb-3 d-flex align-items-center justify-content-center text-uppercase shadow-sm"
              style={{ width: '96px', height: '96px', fontSize: '2rem' }}
            >
              {userProfile.name ? userProfile.name.slice(0, 2) : 'SS'}
            </div>
            <h4 className="fw-bold text-dark mb-1">{userProfile.name}</h4>
            <div className="mb-2">
              <span className="badge badge-role-hr px-2 py-1 small">
                {userProfile.role}
              </span>
            </div>
            <p className="text-secondary small mb-3">{userProfile.email}</p>

            <div className="text-start border-top pt-3 mt-3">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-secondary small">Department</span>
                <span className="fw-semibold small text-dark">{userProfile.department}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-secondary small">Contact Phone</span>
                <span className="font-mono small text-dark">{userProfile.phone}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-secondary small">Employee ID</span>
                <span className="font-mono small text-dark">{userProfile._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-secondary small">Joined On</span>
                <span className="small tabular-nums text-dark">
                  {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form or History */}
        <div className="col-lg-8">
          {isEditing ? (
            <div className="card-clean p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3 text-dark">Update Personal Information</h5>
              <form onSubmit={handleUpdate}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  {isHR && (
                    <>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Department</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="form-select"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Product & Design">Product & Design</option>
                          <option value="Marketing & Sales">Marketing & Sales</option>
                          <option value="Finance & Legal">Finance & Legal</option>
                          <option value="Operations">Operations</option>
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="form-select"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="HR">HR Admin</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      New Password (leave empty to keep unchanged)
                    </label>
                    <input
                      type="password"
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-control"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-end gap-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-light btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary-custom btn-sm">
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {/* Recent Attendance */}
              <div className="card-clean">
                <div className="card-header-clean">
                  <h6 className="fw-bold mb-0 text-dark">Recent Attendance Activity</h6>
                  <span className="text-secondary small font-mono">{attendanceRecords.length} records</span>
                </div>
                <div className="p-0">
                  {attendanceRecords.length === 0 ? (
                    <p className="p-4 text-center text-muted small mb-0">No attendance records logged.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-clean mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceRecords.slice(0, 5).map((att) => (
                            <tr key={att._id}>
                              <td className="font-mono small">{att.date}</td>
                              <td className="font-mono small">{att.checkIn || '--'}</td>
                              <td className="font-mono small">{att.checkOut || '--'}</td>
                              <td>
                                <span className="badge badge-status-present">{att.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Leaves */}
              <div className="card-clean">
                <div className="card-header-clean">
                  <h6 className="fw-bold mb-0 text-dark">Leave Application History</h6>
                  <span className="text-secondary small font-mono">{leavesList.length} applications</span>
                </div>
                <div className="p-0">
                  {leavesList.length === 0 ? (
                    <p className="p-4 text-center text-muted small mb-0">No leave history found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-clean mb-0">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>From - To</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leavesList.slice(0, 5).map((l) => (
                            <tr key={l._id}>
                              <td className="fw-semibold small">{l.leaveType}</td>
                              <td className="small tabular-nums">
                                {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                              </td>
                              <td className="small text-secondary text-truncate" style={{ maxWidth: '200px' }}>
                                {l.reason}
                              </td>
                              <td>
                                <span className={`badge ${l.status === 'Approved' ? 'badge-status-approved' : l.status === 'Rejected' ? 'badge-status-rejected' : 'badge-status-pending'}`}>
                                  {l.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
