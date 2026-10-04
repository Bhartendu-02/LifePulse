import React from 'react';

export default function BloodStockBadge({ bloodGroup, units, onClick, clickable = false }) {
  const stock = typeof units === 'number' ? units : 0;

  let stateClass = 'stock-healthy';
  let labelText = `${stock} units`;

  if (stock === 0) {
    stateClass = 'stock-depleted';
    labelText = '0 units';
  } else if (stock <= 2) {
    stateClass = 'stock-critical';
    labelText = `${stock} units (low)`;
  }

  return (
    <div
      className={`blood-badge ${stateClass} ${clickable ? 'badge-clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      title={clickable ? `Click to reserve ${bloodGroup} units` : undefined}
    >
      <div className="blood-badge-top">
        <span className="blood-group-tag">{bloodGroup}</span>
      </div>
      <span className="blood-units-count">{labelText}</span>
    </div>
  );
}
