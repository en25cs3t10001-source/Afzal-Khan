import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import { announcementService } from '../services/api';

export default function Announcements() {
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isHR = currentUser?.role === 'HR';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Normal',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load announcements',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      priority: 'Normal',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setSelectedId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      priority: item.priority || 'Normal',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await announcementService.createAnnouncement(formData);
        setNotification({
          type: 'success',
          message: res.data.message || 'Announcement posted successfully',
        });
      } else {
        const res = await announcementService.updateAnnouncement(selectedId, formData);
        setNotification({
          type: 'success',
          message: res.data.message || 'Announcement updated successfully',
        });
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save announcement',
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    try {
      await announcementService.deleteAnnouncement(id);
      setNotification({
        type: 'success',
        message: 'Announcement deleted successfully',
      });
      fetchAnnouncements();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete announcement',
      });
    } finally {
      setTimeout(() => setNotification({ type: '', message: '' }), 4000);
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'Urgent') return 'bg-danger text-white';
    if (priority === 'Important') return 'bg-warning text-dark';
    return 'bg-secondary text-white';
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Announcements</h3>
          <p className="text-secondary small mb-0">
            Official communications, organizational policies, and general staff notifications
          </p>
        </div>
        {isHR && (
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary-custom d-flex align-items-center gap-2"
          >
            <i className="bi bi-megaphone-fill"></i>
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type} py-2 px-3 small d-flex align-items-center justify-content-between mb-4`}>
          <span>{notification.message}</span>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}

      {loading ? (
        <Loading message="Loading company announcements..." />
      ) : announcements.length === 0 ? (
        <div className="card-clean p-5 text-center text-muted">
          <i className="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>
          <h6>No Announcements Yet</h6>
          <p className="small mb-0">Check back later for company news and administrative notices.</p>
        </div>
      ) : (
        <div className="row g-4">
          {announcements.map((item) => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <div className="card-clean h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`badge ${getPriorityBadge(item.priority)} px-2 py-1 small`}>
                      {item.priority}
                    </span>
                    <span className="text-muted small tabular-nums" style={{ fontSize: '0.75rem' }}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-light border text-primary fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                    >
                      {item.createdBy?.name ? item.createdBy.name.slice(0, 1) : 'H'}
                    </div>
                    <span className="small text-secondary">
                      {item.createdBy?.name || 'HR Admin'}
                    </span>
                  </div>

                  {isHR && (
                    <div className="btn-group btn-group-sm">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="btn btn-outline-secondary border-0 p-1"
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
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
                  {modalMode === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-control"
                      placeholder="e.g. Office Closed: National Holiday Notice"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Announcement Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-control"
                      placeholder="Type the full announcement content here..."
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom">
                    {submitting ? 'Posting...' : modalMode === 'create' ? 'Publish Announcement' : 'Update Changes'}
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
