import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p style={{ fontWeight: '500', color: '#374151' }}>Analyzing screenshot...</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Running forensic checks</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;