import React from 'react';

const ScoreCard = ({ trustScore }) => {
  const getScoreColor = () => {
    if (trustScore >= 80) return '#16a34a';
    if (trustScore >= 50) return '#ca8a04';
    return '#dc2626';
  };

  const getRiskLabel = () => {
    if (trustScore >= 80) return 'Low Risk';
    if (trustScore >= 50) return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskColor = () => {
    if (trustScore >= 80) return { bg: '#dcfce7', color: '#166534' };
    if (trustScore >= 50) return { bg: '#fef9c3', color: '#854d0e' };
    return { bg: '#fee2e2', color: '#991b1b' };
  };

  const risk = getRiskColor();

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '1rem' }}>
        Trust Score
      </h3>
      <div style={{ fontSize: '3.75rem', fontWeight: 'bold', color: getScoreColor() }}>
        {trustScore}/100
      </div>
      <div style={{ marginTop: '0.75rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: '500',
          background: risk.bg,
          color: risk.color
        }}>
          {getRiskLabel()}
        </span>
      </div>
    </div>
  );
};

export default ScoreCard;