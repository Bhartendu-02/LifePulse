import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import SosRequestCard from '../components/SosRequestCard';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = [
  { val: 'CRITICAL', label: 'Critical (Accident / Immediate surgery required)' },
  { val: 'URGENT', label: 'Urgent (Required within 2-4 hours)' },
  { val: 'MODERATE', label: 'Moderate (Required today)' }
];

export default function RequestBlood() {
  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    hospitalName: '',
    city: 'Delhi',
    bloodGroupNeeded: 'O-',
    unitsNeeded: 1,
    urgency: 'CRITICAL',
    contactPerson: '',
    contactPhone: '',
    caseDescription: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Feed State
  const [requests, setRequests] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('ALL');

  const fetchRequests = async () => {
    setFeedLoading(true);
    setFeedError('');
    try {
      const res = await api.get('/emergency/requests');
      setRequests(res.data);
    } catch (err) {
      setFeedError(err.response?.data?.message || 'Unable to load blood requests.');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormSuccess('');
    setFormError('');

    try {
      const res = await api.post('/emergency/requests', formData);
      setFormSuccess('Your emergency blood request has been posted successfully.');
      setRequests((prev) => [res.data, ...prev]);

      // Reset form fields
      setFormData({
        patientName: '',
        hospitalName: '',
        city: formData.city,
        bloodGroupNeeded: 'O-',
        unitsNeeded: 1,
        urgency: 'CRITICAL',
        contactPerson: '',
        contactPhone: '',
        caseDescription: ''
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit blood request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFulfill = async (id) => {
    try {
      await api.patch(`/emergency/requests/${id}/fulfill`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as fulfilled');
    }
  };

  const displayedRequests = requests.filter((r) => {
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Emergency Blood Requests (SOS)</h1>
        <p className="page-description">
          Broadcast urgent blood requirements to nearby donors and hospitals, or fulfill an open request for a patient.
        </p>
      </div>

      <div className="grid-2">
        {/* Left: Form to Post SOS Request */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Post a Blood Request</h2>
              <div className="card-subtitle">Fill in patient, hospital, and contact details</div>
            </div>
            <span className="badge badge-secondary" title="Requests automatically expire after 24 hours">
              ⏱ 24h Auto-Expiry
            </span>
          </div>

          {formSuccess && (
            <div className="alert alert-success">
              <span>✓ {formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="alert alert-danger">
              <span>⚠️ {formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="patientName">Patient Name or Case Description *</label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                required
                placeholder="e.g. Rahul Sharma (Accident victim, ICU Bed 4)"
                value={formData.patientName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hospitalName">Hospital Name *</label>
                <input
                  id="hospitalName"
                  name="hospitalName"
                  type="text"
                  required
                  placeholder="e.g. AIIMS Trauma Center"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="e.g. Delhi, Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodGroupNeeded">Blood Group *</label>
                <select
                  id="bloodGroupNeeded"
                  name="bloodGroupNeeded"
                  value={formData.bloodGroupNeeded}
                  onChange={handleChange}
                  className="form-control font-mono"
                >
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="unitsNeeded">Units Needed *</label>
                <input
                  id="unitsNeeded"
                  name="unitsNeeded"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.unitsNeeded}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency *</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="form-control"
                >
                  {URGENCIES.map((u) => (
                    <option key={u.val} value={u.val}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person (Doctor / Relative) *</label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh or Manoj Verma"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone Number *</label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  placeholder="e.g. 9811001122"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="form-control font-mono"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="caseDescription">Additional Notes / OT / Ward (Optional)</label>
              <textarea
                id="caseDescription"
                name="caseDescription"
                rows="2"
                placeholder="e.g. Patient undergoing emergency surgery. Any A+ or O+ donor please call immediately."
                value={formData.caseDescription}
                onChange={handleChange}
                className="form-control"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-danger btn-block btn-lg"
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting Request...' : '🚨 Post Emergency Blood Request'}
            </button>
          </form>
        </div>

        {/* Right: Live List of Active Requests */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Live Blood Requests</h2>
              <div className="card-subtitle">Active patient requirements from hospitals</div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={fetchRequests}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Urgency Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterUrgency === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterUrgency('ALL')}
            >
              All ({requests.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterUrgency === 'CRITICAL' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => setFilterUrgency('CRITICAL')}
            >
              Critical
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterUrgency === 'URGENT' ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => setFilterUrgency('URGENT')}
            >
              Urgent
            </button>
          </div>

          {feedError && (
            <div className="alert alert-danger">
              <span>{feedError}</span>
            </div>
          )}

          {feedLoading ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>
              Loading open blood requests...
            </div>
          ) : displayedRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedRequests.map((req) => (
                <SosRequestCard
                  key={req._id}
                  request={req}
                  onFulfill={handleFulfill}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>✅</div>
              <h4 style={{ color: '#0f172a', marginBottom: '4px' }}>No Pending Requests</h4>
              <p style={{ fontSize: '0.88rem' }}>
                All emergency blood requests have been fulfilled or resolved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
