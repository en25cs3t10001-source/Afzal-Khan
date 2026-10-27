import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleMobileSidebar, pageTitle = 'Dashboard' }) {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'HR':
        return 'badge-role-hr';
      case 'Manager':
        return 'badge-role-manager';
      default:
        return 'badge-role-employee';
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-navbar">
      {/* Left zone: Mobile trigger & Breadcrumb */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-lg-none py-1 px-2"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small d-none d-sm-inline">StaffSync</span>
          <span className="text-secondary small d-none d-sm-inline">/</span>
          <h1 className="h6 mb-0 fw-bold text-dark">{pageTitle}</h1>
        </div>
      </div>

      {/* Right zone: Date & Profile actions */}
      <div className="d-flex align-items-center gap-3">
        <div className="text-secondary small d-none d-md-flex align-items-center gap-1">
          <i className="bi bi-calendar3"></i>
          <span>{formattedDate}</span>
        </div>

        <div className="vr d-none d-md-block my-2 text-secondary opacity-25"></div>

        {user && (
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge rounded-pill px-2 py-1 small fw-semibold ${getRoleBadgeClass(
                user.role
              )}`}
            >
              {user.role}
            </span>

            <div
              onClick={() => navigate('/profile')}
              role="button"
              className="d-flex align-items-center gap-2 text-decoration-none text-dark cursor-pointer p-1 rounded-2 hover-bg"
              title="View Profile"
            >
              <div
                className="rounded-circle bg-light border border-secondary border-opacity-25 d-flex align-items-center justify-content-center text-primary fw-bold"
                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="small fw-semibold d-none d-sm-inline">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-secondary border-0 p-1 text-secondary"
              title="Logout"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
