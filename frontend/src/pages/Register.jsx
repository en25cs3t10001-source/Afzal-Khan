import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '520px' }}>
        {/* Brand header */}
        <div className="text-center mb-4">
          <div
            className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm"
            style={{ width: '48px', height: '48px', fontSize: '1.25rem', fontWeight: 800 }}
          >
            SS
          </div>
          <h2 className="fw-bold tracking-tight text-dark mb-1">StaffSync</h2>
          <p className="text-secondary small mb-0">Create Organization Account</p>
        </div>

        {/* Register Card */}
        <div className="card-clean p-4 p-sm-5 bg-white mb-4">
          <h4 className="fw-bold mb-1 text-dark">Register New Staff Profile</h4>
          <p className="text-secondary small mb-4">
            Provide your organizational details to setup your access
          </p>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="form-control"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.m@staffsync.com"
                  className="form-control"
                />
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Access Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR Admin</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
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
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 012-3456"
                  className="form-control"
                />
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Password (min 6 chars)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-control"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-custom w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <i className="bi bi-check-circle"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-secondary small">Already registered? </span>
            <Link to="/login" className="text-primary text-decoration-none fw-semibold small">
              Sign In here
            </Link>
          </div>
        </div>

        <div className="text-center text-muted small">
          StaffSync HRMS &copy; 2026. All data encrypted and secured.
        </div>
      </div>
    </div>
  );
}
