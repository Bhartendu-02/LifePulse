import React from 'react';

export default function DonorCard({ donor }) {
  if (!donor) return null;

  const donationHistoryText = donor.lastDonationDate
    ? `Last Donated: ${new Date(donor.lastDonationDate).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      })}`
    : 'Available standby donor';

  return (
    <div className="donor-card">
      <div className="donor-info">
        <div className="donor-blood-circle">
          {donor.bloodGroup}
        </div>
        <div>
          <div className="donor-name">{donor.name}</div>
          <div className="donor-meta">
            📍 {donor.city} &bull; {donationHistoryText}
          </div>
        </div>
      </div>

      <div>
        <a
          href={`tel:${donor.phone}`}
          className="btn btn-outline btn-sm"
        >
          📞 Call {donor.phone}
        </a>
      </div>
    </div>
  );
}
