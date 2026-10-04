import React from 'react';
import { PhoneIcon } from './Icons';

export default function CallButton({
  phoneNumber,
  label = 'Call',
  variant = 'critical',
  size = 'default',
  showNumber = true
}) {
  if (!phoneNumber) return null;

  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  return (
    <a
      href={`tel:${cleanPhone}`}
      className={`call-btn call-btn-${variant} call-btn-${size}`}
      aria-label={`${label} ${phoneNumber}`}
    >
      <PhoneIcon size={14} className="call-btn-icon" />
      <span className="call-btn-text">
        <span className="call-btn-label">{label}</span>
        {showNumber && <span className="call-btn-number">{phoneNumber}</span>}
      </span>
    </a>
  );
}
