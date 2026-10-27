import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import {
  userService,
  leaveService,
  attendanceService,
  announcementService,
  trainingService,
} from '../services/api';

export default function Dashboard() {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const role = user?.role || 'Employee';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    pendingLeaves: 0,
    presentToday: 0,
    trainingCount: 0,
    announcementsCount: 0,
    teamMembersCount: 0,
  });

  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const todayDateStr = new Date().toISOString().split('T')[0];

      // Fetch common data in parallel
      const [annRes, trainRes, leavesRes, attRes] = await Promise.all([
        announcementService.getAnnouncements(),
        trainingService.getTrainings(),
        leaveService.getLeaves(),
        attendanceService.getAttendance({ date: todayDateStr }),
      ]);

      const allAnnouncements = annRes.data.announcements || [];
      const allTrainings = trainRes.data.trainings || [];
      const allLeaves = leavesRes.data.leaves || [];
      const todayRecords = attRes.data.attendance || [];

      setAnnouncements(allAnnouncements.slice(0, 4));
      setTrainings(allTrainings.slice(0, 4));
      setLeaves(allLeaves);

      // Check current user attendance for today
      const myRecord = todayRecords.find(
        (r) => r.employee?._id === user?._id || r.employee === user?._id
      );
      setTodayAttendance(myRecord || null);

      if (role === 'HR') {
        const usersRes = await userService.getUsers();
        const usersList = usersRes.data.users || [];
        const managers = usersList.filter((u) => u.role === 'Manager').length;
        const pending = allLeaves.filter((l) => l.status === 'Pending').length;
        const present = todayRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;

        setStats({
          totalEmployees: usersList.length,
          totalManagers: managers,
          pendingLeaves: pending,
          presentToday: present,
          trainingCount: allTrainings.length,
          announcementsCount: allAnnouncements.length,
        });
      } else if (role === 'Manager') {
        const teamRes = await userService.getUsers();
        const teamList = teamRes.data.users || [];
        const pending = allLeaves.filter((l) => l.status === 'Pending').length;
        const present = todayRecords.filter(
          (a) => a.status === 'Present' || a.status === 'Late'
        ).length;

        setStats({
          teamMembersCount: teamList.length,
          pendingLeaves: pending,
          presentToday: present,
          trainingCount: allTrainings.length,
          announcementsCount: allAnnouncements.length,
        });
      } else {
        // Employee
        const pending = allLeaves.filter((l) => l.status === 'Pending').length;
        const approved = allLeaves.filter((l) => l.status === 'Approved').length;

        setStats({
          pendingLeaves: pending,
          approvedLeaves: approved,
          trainingCount: allTrainings.length,
          announcementsCount: allAnnouncements.length,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Quick mark attendance handler
  const handleMarkAttendance = async () => {
    try {
      setActionLoading(true);
      const res = await attendanceService.markAttendance({});
      setNotification({
        type: 'success',
        message: res.data.message || 'Attendance recorded successfully!',
      });
      fetchDashboardData();
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

  // Quick leave approval/rejection handler for HR & Managers
  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      setActionLoading(true);
      await leaveService.updateLeaveStatus(leaveId, {
        status: decision,
        adminComment: `Processed by ${user.name} via Dashboard quick review`,
      });
      setNotification({
        type: 'success',
        message: `Leave request has been marked as ${decision}`,
      });
      fetchDashboardData();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to process leave action',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard metrics..." />;
  }

  const pendingLeavesList = leaves.filter((l) => l.status === 'Pending');

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card-clean p-4 mb-4 bg-white">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="text-secondary small">Organization Portal</span>
              <span className="text-muted">·</span>
              <span className="text-primary fw-semibold small">{user?.department}</span>
            </div>
            <h2 className="fw-bold tracking-tight text-dark mb-1">
              Welcome back, {user?.name || 'Colleague'}
            </h2>
            <p className="text-secondary small mb-0">
              Here is an executive summary of today's organizational activities, attendance status, and pending approvals.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            {role === 'Employee' ? (
              <div>
                <button
                  onClick={handleMarkAttendance}
                  disabled={actionLoading || (todayAttendance && todayAttendance.checkOut)}
                  className={`btn ${
                    !todayAttendance
                      ? 'btn-success'
                      : !todayAttendance.checkOut
                      ? 'btn-warning text-dark'
                      : 'btn-outline-secondary'
                  } btn-sm px-3 py-2 fw-semibold shadow-sm`}
                >
                  <i className="bi bi-clock-history me-1"></i>
                  {!todayAttendance
                    ? 'Check In for Today'
                    : !todayAttendance.checkOut
                    ? 'Check Out Now'
                    : 'Attendance Completed Today'}
                </button>
              </div>
            ) : (
              <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                <Link to="/leaves" className="btn btn-outline-primary btn-sm">
                  Review Leaves ({pendingLeavesList.length})
                </Link>
                {role === 'HR' && (
                  <Link to="/employees" className="btn btn-primary-custom btn-sm">
                    Manage Staff
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setNotification({ type: '', message: '' })}
          ></button>
        </div>
      )}

      {/* Role-Specific Metric Cards */}
      {role === 'HR' && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon="bi-people"
              subtitle="Registered staff accounts"
              color="primary"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Total Managers"
              value={stats.totalManagers}
              icon="bi-person-gear"
              subtitle="Department team leads"
              color="purple"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Pending Leaves"
              value={stats.pendingLeaves}
              icon="bi-calendar-check"
              subtitle="Awaiting administrative review"
              color="warning"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Present Today"
              value={stats.presentToday}
              icon="bi-check2-circle"
              subtitle="Active clocked-in records"
              color="success"
            />
          </div>
        </div>
      )}

      {role === 'Manager' && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Team Members"
              value={stats.teamMembersCount}
              icon="bi-people"
              subtitle={`${user?.department} Department`}
              color="primary"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Pending Team Leaves"
              value={stats.pendingLeaves}
              icon="bi-calendar-event"
              subtitle="Requires your approval"
              color="warning"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Present Employees"
              value={stats.presentToday}
              icon="bi-person-check"
              subtitle="Checked in today"
              color="success"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Training Programs"
              value={stats.trainingCount}
              icon="bi-mortarboard"
              subtitle="Upcoming skill sessions"
              color="info"
            />
          </div>
        </div>
      )}

      {role === 'Employee' && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="card-clean p-4 h-100">
              <span className="stat-label">Today's Attendance</span>
              <div className="mt-2">
                {todayAttendance ? (
                  <div>
                    <span className="badge badge-status-present me-2">
                      {todayAttendance.status}
                    </span>
                    <div className="small text-secondary mt-1">
                      Check In: <strong className="font-mono text-dark">{todayAttendance.checkIn || '--'}</strong>
                    </div>
                    {todayAttendance.checkOut && (
                      <div className="small text-secondary">
                        Check Out: <strong className="font-mono text-dark">{todayAttendance.checkOut}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="badge badge-status-absent me-2">Not Checked In</span>
                    <div className="small text-muted mt-1">Clock in via the top button</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Pending Requests"
              value={stats.pendingLeaves || 0}
              icon="bi-hourglass-split"
              subtitle="Leaves awaiting approval"
              color="warning"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Approved Leaves"
              value={stats.approvedLeaves || 0}
              icon="bi-check-all"
              subtitle="Approved leave records"
              color="success"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Available Trainings"
              value={stats.trainingCount}
              icon="bi-mortarboard"
              subtitle="Scheduled workshops"
              color="info"
            />
          </div>
        </div>
      )}

      {/* Main Content Grid: Leaves & Announcements */}
      <div className="row g-4">
        {/* Left Column: Pending Leaves or Team Activity */}
        <div className="col-lg-7">
          <div className="card-clean h-100">
            <div className="card-header-clean">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  {role === 'Employee' ? 'My Leave Applications' : 'Pending Leave Requests'}
                </h6>
                <small className="text-secondary">
                  {role === 'Employee' ? 'Status of your submitted requests' : 'Action items awaiting review'}
                </small>
              </div>
              <Link to="/leaves" className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold">
                View All
              </Link>
            </div>

            <div className="p-0">
              {leaves.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  <i className="bi bi-inbox fs-3 d-block mb-1 opacity-50"></i>
                  No leave requests recorded yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-clean mb-0">
                    <thead>
                      <tr>
                        {role !== 'Employee' && <th>Employee</th>}
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Status</th>
                        {(role === 'HR' || role === 'Manager') && <th className="text-end">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(role === 'Employee' ? leaves.slice(0, 5) : pendingLeavesList.slice(0, 5)).map((leave) => (
                        <tr key={leave._id}>
                          {role !== 'Employee' && (
                            <td>
                              <div className="fw-semibold text-dark">{leave.employee?.name || 'Staff Member'}</div>
                              <small className="text-muted">{leave.employee?.department}</small>
                            </td>
                          )}
                          <td>
                            <span className="fw-medium text-dark">{leave.leaveType}</span>
                          </td>
                          <td>
                            <div className="small tabular-nums text-secondary">
                              {new Date(leave.startDate).toLocaleDateString()} –{' '}
                              {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                leave.status === 'Approved'
                                  ? 'badge-status-approved'
                                  : leave.status === 'Rejected'
                                  ? 'badge-status-rejected'
                                  : 'badge-status-pending'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          {(role === 'HR' || role === 'Manager') && (
                            <td className="text-end">
                              {leave.status === 'Pending' ? (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                                    disabled={actionLoading}
                                    className="btn btn-outline-success py-1 px-2"
                                    title="Approve Leave"
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </button>
                                  <button
                                    onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                                    disabled={actionLoading}
                                    className="btn btn-outline-danger py-1 px-2"
                                    title="Reject Leave"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small">Decided</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Announcements & Upcoming Training */}
        <div className="col-lg-5">
          <div className="d-flex flex-column gap-4">
            {/* Announcements Card */}
            <div className="card-clean">
              <div className="card-header-clean">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Company Announcements</h6>
                  <small className="text-secondary">Official organization updates</small>
                </div>
                <Link to="/announcements" className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold">
                  View All
                </Link>
              </div>
              <div className="p-3">
                {announcements.length === 0 ? (
                  <p className="text-muted small text-center my-3">No active announcements</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {announcements.map((item) => (
                      <div key={item._id} className="p-3 rounded-3 bg-light border border-light">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-semibold text-dark small">{item.title}</span>
                          <span className={`badge ${item.priority === 'Urgent' ? 'bg-danger' : item.priority === 'Important' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-secondary small mb-2 text-truncate" style={{ maxWidth: '350px' }}>
                          {item.description}
                        </p>
                        <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                          <span>Posted by {item.createdBy?.name || 'HR Admin'}</span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Training Programs Card */}
            <div className="card-clean">
              <div className="card-header-clean">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Upcoming Training</h6>
                  <small className="text-secondary">Skill development sessions</small>
                </div>
                <Link to="/training" className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold">
                  Browse
                </Link>
              </div>
              <div className="p-3">
                {trainings.length === 0 ? (
                  <p className="text-muted small text-center my-3">No upcoming training programs</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {trainings.map((t) => (
                      <div key={t._id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                        <div>
                          <div className="fw-semibold small text-dark">{t.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Trainer: {t.trainer} · {t.department}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="badge bg-light text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                            {t.duration}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(t.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
