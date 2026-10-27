import React from 'react';

export default function StatCard({ title, value, icon, subtitle, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb' },
    success: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16a34a' },
    warning: { bg: 'rgba(217, 119, 6, 0.1)', text: '#d97706' },
    info: { bg: 'rgba(3, 105, 161, 0.1)', text: '#0284c7' },
    danger: { bg: 'rgba(220, 38, 38, 0.1)', text: '#dc2626' },
    purple: { bg: 'rgba(109, 40, 217, 0.1)', text: '#7c3aed' },
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div className="card-clean p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="stat-label">{title}</span>
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: '42px', height: '42px', backgroundColor: selectedColor.bg, color: selectedColor.text }}
        >
          <i className={`bi ${icon} fs-5`}></i>
        </div>
      </div>
      <div className="stat-value tabular-nums mb-1">{value}</div>
      {subtitle && <div className="text-muted small">{subtitle}</div>}
    </div>
  );
}
