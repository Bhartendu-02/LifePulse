import React from 'react';

function formatElapsed(dateString) {
  if (!dateString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export default function SosRequestCard({ request, onFulfill }) {
  if (!request) return null;

  const urgency = (request.urgency || 'CRITICAL').toUpperCase();
  let urgencyBadgeClass = 'badge-danger';
  let cardClass = 'request-card';

  if (urgency === 'URGENT') {
    urgencyBadgeClass = 'badge-warning';
    cardClass = 'request-card urgent';
  } else if (urgency === 'MODERATE') {
    urgencyBadgeClass = 'badge-secondary';
    cardClass = 'request-card moderate';
  }

  return (
    <div className={cardClass}>
      <div className="request-header">
        <div>
          <span className={`badge ${urgencyBadgeClass}`} style={{ marginRight: '6px' }}>
            {urgency}
          </span>
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
            ⏱ {formatElapsed(request.createdAt)}
          </span>
        </div>

        <div>
          <span className="badge badge-danger font-mono" style={{ fontSize: '0.85rem' }}>
            {request.bloodGroupNeeded} ({request.unitsNeeded} unit{request.unitsNeeded !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      <h4 className="request-patient">{request.patientName}</h4>
      <div className="request-hospital">
        📍 {request.hospitalName}, {request.city}
      </div>

      {request.caseDescription && (
        <div className="request-note">
          "{request.caseDescription}"
        </div>
      )}

      <div className="request-footer">
        <a
          href={`tel:${request.contactPhone}`}
          className="btn btn-danger btn-sm"
        >
          📞 Call {request.contactPerson} ({request.contactPhone})
        </a>

        {request.status === 'OPEN' && onFulfill && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onFulfill(request._id)}
          >
            ✓ Mark Fulfilled
          </button>
        )}
      </div>
    </div>
  );
}
