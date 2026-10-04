import React from 'react';

export default function HospitalCard({ hospital, onReserveClick }) {
  if (!hospital) return null;

  const directionsUrl = hospital.googleMapsUrl || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${hospital.hospitalName} ${hospital.address} ${hospital.city}`
    )}`;

  const bloodEntries = hospital.bloodUnits ? Object.entries(hospital.bloodUnits) : [];

  return (
    <div className="hospital-card">
      <div className="hospital-header">
        <div>
          <h3 className="hospital-name">{hospital.hospitalName}</h3>
          <div className="hospital-address">
            📍 {hospital.address}, {hospital.city}
          </div>
        </div>

        <div>
          {hospital.hasTraumaICU ? (
            <span className="badge badge-success">
              ✓ Trauma ICU Available
            </span>
          ) : (
            <span className="badge badge-secondary">
              General Emergency Ward
            </span>
          )}
        </div>
      </div>

      {hospital.matchedGroups && hospital.matchedGroups.length > 0 && (
        <div className="alert alert-info" style={{ padding: '6px 12px', fontSize: '0.82rem', marginBottom: '10px' }}>
          <span>Compatible Blood in Stock: <strong>{hospital.matchedGroups.join(', ')}</strong></span>
        </div>
      )}

      {/* Blood Stock Section */}
      <div className="blood-stock-section">
        <div className="blood-stock-label">Available Blood Units:</div>
        <div className="blood-grid">
          {bloodEntries.map(([grp, units]) => {
            let statusClass = 'out';
            if (units > 5) statusClass = 'available';
            else if (units > 0) statusClass = 'low';

            return (
              <div
                key={grp}
                className={`blood-item ${statusClass}`}
                title={units > 0 ? `Click to reserve ${grp} blood` : 'Out of stock'}
                style={{ cursor: units > 0 ? 'pointer' : 'default' }}
                onClick={() => {
                  if (units > 0 && onReserveClick) {
                    onReserveClick(hospital, grp);
                  }
                }}
              >
                <span className="blood-item-group">{grp}</span>
                <span className="blood-item-units">{units} unit{units !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="hospital-footer-actions">
        <a
          href={`tel:${hospital.contactPhone}`}
          className="btn btn-danger btn-sm"
        >
          📞 Call: {hospital.contactPhone}
        </a>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onReserveClick && onReserveClick(hospital)}
        >
          🩸 Reserve Units
        </button>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
        >
          📍 Google Maps
        </a>
      </div>
    </div>
  );
}
