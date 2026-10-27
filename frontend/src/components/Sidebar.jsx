import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ showMobile, onCloseMobile }) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const role = user?.role || 'Employee';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define navigation items based on role specifications
  let navItems = [];

  if (role === 'HR') {
    navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
      { path: '/employees', label: 'Employees', icon: 'bi-people' },
      { path: '/leaves', label: 'Leaves', icon: 'bi-calendar-check' },
      { path: '/attendance', label: 'Attendance', icon: 'bi-clock-history' },
      { path: '/announcements', label: 'Announcements', icon: 'bi-megaphone' },
      { path: '/training', label: 'Training', icon: 'bi-mortarboard' },
      { path: '/profile', label: 'Profile', icon: 'bi-person-badge' },
    ];
  } else if (role === 'Manager') {
    navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
      { path: '/employees', label: 'My Team', icon: 'bi-people' },
      { path: '/leaves', label: 'Leaves', icon: 'bi-calendar-check' },
      { path: '/attendance', label: 'Attendance', icon: 'bi-clock-history' },
      { path: '/training', label: 'Training', icon: 'bi-mortarboard' },
      { path: '/announcements', label: 'Announcements', icon: 'bi-megaphone' },
      { path: '/profile', label: 'Profile', icon: 'bi-person-badge' },
    ];
  } else {
    // Employee
    navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
      { path: '/profile', label: 'My Profile', icon: 'bi-person-badge' },
      { path: '/leaves', label: 'My Leaves', icon: 'bi-calendar-check' },
      { path: '/attendance', label: 'Attendance', icon: 'bi-clock-history' },
      { path: '/training', label: 'Training', icon: 'bi-mortarboard' },
      { path: '/announcements', label: 'Announcements', icon: 'bi-megaphone' },
    ];
  }

  return (
    <>
      {showMobile && (
        <div className="sidebar-backdrop d-lg-none" onClick={onCloseMobile} />
      )}
      <aside className={`sidebar ${showMobile ? 'show' : ''}`}>
        {/* Brand header */}
        <div className="d-flex align-items-center justify-content-between px-3 py-4 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '36px', height: '36px', fontWeight: '800', letterSpacing: '-0.5px' }}
            >
              SS
            </div>
            <div>
              <div className="text-white fw-bold fs-6 lh-1">StaffSync</div>
              <small className="text-secondary" style={{ fontSize: '0.72rem' }}>HR Platform</small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm text-secondary d-lg-none"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Navigation list */}
        <div className="py-3 flex-grow-1 overflow-y-auto">
          <div className="px-3 mb-2 text-uppercase text-secondary fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
            Menu ({role})
          </div>
          <nav className="d-flex flex-column gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              className="rounded-circle bg-primary bg-opacity-25 text-primary fw-bold d-flex align-items-center justify-content-center text-uppercase shrink-0"
              style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
            >
              {user?.name ? user.name.slice(0, 2) : 'SS'}
            </div>
            <div className="min-w-0 flex-grow-1">
              <div className="text-white small fw-semibold text-truncate">{user?.name || 'Staff User'}</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                {role} · {user?.department || 'Operations'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 border-opacity-50 mt-2 py-1"
            style={{ fontSize: '0.8rem' }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
