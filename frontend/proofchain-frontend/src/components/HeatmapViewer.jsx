import React from 'react';

const HeatmapViewer = ({ originalUrl, heatmapUrl }) => {
  if (!heatmapUrl) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '1rem' }}>
          Visual Analysis
        </h3>
        <div style={{ background: '#f3f4f6', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Heatmap will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '1rem' }}>
        Visual Analysis
      </h3>
      <div className="grid-2">
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>
            Original
          </p>
          <img src={originalUrl} alt="Original" style={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', width: '100%' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', width: '0.75rem', height: '0.75rem', background: '#ef4444', borderRadius: '50%', marginRight: '0.25rem' }}></span>
            Suspicious Regions (Heatmap)
          </p>
          <img src={heatmapUrl} alt="Heatmap" style={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default HeatmapViewer;