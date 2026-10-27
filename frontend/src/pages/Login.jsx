import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.login(formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials for reviewers and mentors
  const handleQuickLogin = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand header */}
        <div className="text-center mb-4">
          <div
            className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
            style={{ width: '48px', height: '48px', fontSize: '1.25rem', fontWeight: 800 }}
          >
            SS
          </div>
          <h2 className="fw-bold tracking-tight text-dark mb-1">StaffSync</h2>
          <p className="text-secondary small mb-0">Human Resource Management System</p>
        </div>

        {/* Login Card */}
        <div className="card-clean p-4 p-sm-5 bg-white mb-4">
          <h4 className="fw-bold mb-1 text-dark">Sign in to your account</h4>
          <p className="text-secondary small mb-4">
            Enter your organization email and password
          </p>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary border-end-0">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="form-control border-start-0 ps-0"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary border-end-0">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control border-start-0 ps-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick Switcher */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase text-secondary fw-semibold" style={{ fontSize: '0.7rem' }}>
                Quick Demo Credentials
              </span>
              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Click to fill</span>
            </div>
            <div className="d-grid gap-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@staffsync.com', 'Admin@123')}
                className="btn btn-light btn-sm text-start py-1 px-2 border d-flex justify-content-between align-items-center"
              >
                <span className="small font-monospace">hr@staffsync.com</span>
                <span className="badge badge-role-hr">HR Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@staffsync.com', 'Manager@123')}
                className="btn btn-light btn-sm text-start py-1 px-2 border d-flex justify-content-between align-items-center"
              >
                <span className="small font-monospace">manager@staffsync.com</span>
                <span className="badge badge-role-manager">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@staffsync.com', 'Employee@123')}
                className="btn btn-light btn-sm text-start py-1 px-2 border d-flex justify-content-between align-items-center"
              >
                <span className="small font-monospace">employee@staffsync.com</span>
                <span className="badge badge-role-employee">Employee</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-secondary small">Don't have an account? </span>
            <Link to="/register" className="text-primary text-decoration-none fw-semibold small">
              Register now
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-muted small">
          StaffSync HRMS &copy; 2026. Secure Role-Based Access.
        </div>
      </div>
    </div>
  );
}
