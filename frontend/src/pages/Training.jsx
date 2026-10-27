import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { trainingService } from '../services/api';

export default function Training() {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isHR = currentUser?.role === 'HR';
  const isManager = currentUser?.role === 'Manager';
  const canManageTraining = isHR || isManager;

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: '',
    date: '',
    duration: '',
    department: 'Engineering',
    status: 'Upcoming',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await trainingService.getTrainings();
      setTrainings(res.data.trainings || []);
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch training programs',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      trainer: '',
      date: '',
      duration: '',
      department: currentUser?.department || 'Engineering',
      status: 'Upcoming',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (t) => {
    setModalMode('edit');
    setSelectedId(t._id);
    const dateFormatted = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    setFormData({
      title: t.title,
      description: t.description,
      trainer: t.trainer,
      date: dateFormatted,
      duration: t.duration,
      department: t.department,
      status: t.status || 'Upcoming',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await trainingService.createTraining(formData);
        setNotification({
          type: 'success',
          message: res.data.message || 'Training program scheduled successfully',
        });
      } else {
        const res = await trainingService.updateTraining(selectedId, formData);
        setNotification({
          type: 'success',
          message: res.data.message || 'Training program updated successfully',
        });
      }
      setShowModal(false);
      fetchTrainings();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save training program',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) {
      return;
    }
    try {
      await trainingService.deleteTraining(id);
      setNotification({
        type: 'success',
        message: 'Training program deleted successfully',
      });
      fetchTrainings();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete training program',
      });
    } finally {
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    if (departmentFilter === 'All') return true;
    return t.department === departmentFilter || t.department === 'All';
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Learning & Development</h3>
          <p className="text-secondary small mb-0">
            Professional development workshops, certifications, and technical upskilling sessions
          </p>
        </div>
        {canManageTraining && (
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary-custom d-flex align-items-center gap-2"
          >
            <i className="bi bi-mortarboard-fill"></i>
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-clean p-3 mb-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small fw-semibold">Filter Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Finance & Legal">Finance & Legal</option>
            </select>
          </div>
          <span className="text-secondary small font-mono tabular-nums">
            {filteredTrainings.length} workshops listed
          </span>
        </div>
      </div>

      {loading ? (
        <Loading message="Fetching training schedule..." />
      ) : filteredTrainings.length === 0 ? (
        <div className="card-clean p-5 text-center text-muted">
          <i className="bi bi-mortarboard fs-1 d-block mb-2 opacity-50"></i>
          <h6>No Training Programs Found</h6>
          <p className="small mb-0">No active workshops found for the selected department.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTrainings.map((t) => (
            <div key={t._id} className="col-md-6 col-lg-4">
              <div className="card-clean h-100 p-4 d-flex flex-column justify-content-between bg-white">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 small">
                      {t.department}
                    </span>
                    <span className="badge bg-light text-secondary border px-2 py-1 small">
                      {t.status || 'Upcoming'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                  <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                    {t.description}
                  </p>

                  <div className="bg-light p-3 rounded-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                      <span className="text-secondary small">Trainer</span>
                      <strong className="text-dark small">{t.trainer}</strong>
                    </div>
                    <div className="d-flex align-items-center justify-content-between py-1 border-bottom">
                      <span className="text-secondary small">Scheduled Date</span>
                      <strong className="text-dark small tabular-nums font-mono">
                        {new Date(t.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </div>
                    <div className="d-flex align-items-center justify-content-between py-1">
                      <span className="text-secondary small">Duration</span>
                      <strong className="text-primary small font-mono">{t.duration}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 d-flex align-items-center justify-content-between">
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                    Created by {t.createdBy?.name || 'Administrator'}
                  </span>

                  {canManageTraining && (
                    <div className="btn-group btn-group-sm">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="btn btn-outline-secondary border-0 p-1"
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="btn btn-outline-danger border-0 p-1"
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'create' ? 'Create Training Program' : 'Edit Training Program'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Program Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-control"
                      placeholder="e.g. Modern Full-Stack Development"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Trainer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.trainer}
                        onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                        className="form-control"
                        placeholder="e.g. Dr. Emily Thorne"
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Target Department *
                      </label>
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
                        <option value="All">All Departments</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="form-control"
                        placeholder="e.g. 3 Days or 2 Weeks"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Curriculum & Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-control"
                      placeholder="Summary of course content and learning objectives..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom">
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Schedule Program' : 'Update Program'}
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
