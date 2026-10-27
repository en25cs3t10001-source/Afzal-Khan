import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return (
        <div className="container py-5 text-center">
          <div className="card-clean p-5 mx-auto" style={{ maxWidth: '500px' }}>
            <div className="text-warning mb-3">
              <i className="bi bi-shield-lock fs-1"></i>
            </div>
            <h4 className="fw-bold mb-2">Access Restricted</h4>
            <p className="text-secondary small mb-4">
              Your current role (<strong>{user.role}</strong>) does not have permission to view this section.
            </p>
            <div>
              <a href="/dashboard" className="btn btn-primary btn-sm px-3">
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return <Outlet />;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
