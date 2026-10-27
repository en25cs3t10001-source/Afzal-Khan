import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { userService } from '../services/api';

export default function Employees() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isHR = currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'Manager';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Engineering',
    phone: '',
    profileImage: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setEmployees(res.data.users || []);
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load employees list',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Employee',
      department: 'Engineering',
      phone: '',
      profileImage: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setModalMode('edit');
    setEditingId(emp._id);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // Blank unless changing
      role: emp.role,
      department: emp.department,
      phone: emp.phone,
      profileImage: emp.profileImage || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await userService.createUser(formData);
        setNotification({
          type: 'success',
          message: res.data.message || 'Employee created successfully',
        });
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const res = await userService.updateUser(editingId, payload);
        setNotification({
          type: 'success',
          message: res.data.message || 'Employee updated successfully',
        });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save employee data',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will also remove their leave and attendance records.')) {
      return;
    }
    try {
      await userService.deleteUser(id);
      setNotification({
        type: 'success',
        message: 'Employee record deleted successfully',
      });
      fetchEmployees();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete employee',
      });
    } finally {
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      departmentFilter === 'All' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getRoleBadge = (role) => {
    if (role === 'HR') return 'badge-role-hr';
    if (role === 'Manager') return 'badge-role-manager';
    return 'badge-role-employee';
  };

  return (
    <div>
      {/* Top Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isManager ? 'My Department Team' : 'Employee Management'}
          </h3>
          <p className="text-secondary small mb-0">
            {isManager
              ? `Manage and oversee team members within the ${currentUser?.department} Department`
              : 'Directory of all organizational employees, managers, and administrators'}
          </p>
        </div>
        {isHR && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-clean p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control border-start-0 ps-0"
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Finance & Legal">Finance & Legal</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="col text-md-end text-secondary small">
            Showing <strong className="text-dark tabular-nums">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-dark tabular-nums">{employees.length}</strong> personnel
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card-clean overflow-hidden">
        {loading ? (
          <Loading message="Fetching directory..." />
        ) : filteredEmployees.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
            <h6>No employees found</h6>
            <p className="small mb-0">Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-clean mb-0 align-middle">
              <thead>
                <tr>
                  <th>Employee Profile</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Phone Number</th>
                  <th>Joined Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-light border border-secondary border-opacity-25 text-primary fw-bold d-flex align-items-center justify-content-center text-uppercase shrink-0"
                          style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}
                        >
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{emp.name}</div>
                          <div className="text-muted small">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium text-dark">{emp.department}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 small ${getRoleBadge(emp.role)}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-secondary small">{emp.phone}</span>
                    </td>
                    <td>
                      <span className="text-secondary small tabular-nums">
                        {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/employees/${emp._id}`}
                          className="btn btn-outline-secondary"
                          title="View Profile"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        {isHR && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="btn btn-outline-primary"
                              title="Edit Employee"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              disabled={emp._id === currentUser?._id}
                              className="btn btn-outline-danger"
                              title="Delete Employee"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'Add New Employee' : 'Edit Employee Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="e.g. Rachel Adams"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        disabled={modalMode === 'edit'}
                        value={formData.email}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="rachel.a@staffsync.com"
                      />
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
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
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleFormChange}
                        className="form-select"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR Admin</option>
                      </select>
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="+1 (555) 012-3456"
                      />
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        {modalMode === 'create' ? 'Password *' : 'New Password (optional)'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        required={modalMode === 'create'}
                        minLength={6}
                        value={formData.password}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary-custom"
                  >
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Employee' : 'Update Changes'}
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
