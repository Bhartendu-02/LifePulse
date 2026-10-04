import React from 'react';

/**
 * SkeletonCard Component
 * Pulsing placeholder card providing instant perceived performance during async queries.
 */
export default function SkeletonCard({ height = '140px' }) {
  return (
    <div
      className="skeleton skeleton-card"
      style={{ minHeight: height }}
      aria-hidden="true"
    >
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-subtitle"></div>
      <div className="skeleton-line skeleton-body"></div>
    </div>
  );
}
