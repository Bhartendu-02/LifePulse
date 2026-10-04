import React, { useState } from 'react';
import api from '../api/axios';

export default function ReserveModal({ hospital, onClose, onReserved }) {
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [units, setUnits] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!hospital) return null;

  const currentAvailable = hospital.bloodUnits?.[bloodGroup] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/emergency/reserve', {
        hospitalId: hospital._id,
        bloodGroup,
        units: parseInt(units, 10)
      });
      setResult(res.data);
      if (onReserved) {
        onReserved(hospital._id, bloodGroup, res.data.remainingStock);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete blood reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Reserve Blood Units</h3>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              {hospital.hospitalName}
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {result ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            <h4 style={{ marginBottom: '6px' }}>Reservation Confirmed!</h4>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              {result.message}
            </p>
            <div className="badge badge-success" style={{ fontSize: '0.88rem', padding: '4px 10px', marginBottom: '16px' }}>
              Remaining {bloodGroup} stock: {result.remainingStock} units
            </div>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '18px' }}>
              Please show this confirmation at the hospital blood bank counter upon arrival.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="modal-bloodGroup">Select Blood Group:</label>
              <select
                id="modal-bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="form-control font-mono"
              >
                {Object.entries(hospital.bloodUnits || {}).map(([grp, count]) => (
                  <option key={grp} value={grp}>
                    {grp} ({count > 0 ? `${count} units available` : 'Out of stock'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label htmlFor="modal-units">Number of Units to Reserve:</label>
                <span className={currentAvailable < units ? 'text-danger' : 'text-success'} style={{ fontSize: '0.8rem' }}>
                  Available: {currentAvailable}
                </span>
              </div>
              <input
                id="modal-units"
                type="number"
                min="1"
                max={Math.max(1, currentAvailable)}
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value, 10) || 1)}
                className="form-control"
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading || currentAvailable === 0 || currentAvailable < units}
              >
                {loading ? 'Reserving...' : `Reserve ${units} Unit(s)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
