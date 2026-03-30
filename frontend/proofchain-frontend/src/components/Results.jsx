import React from 'react';
import ScoreCard from './ScoreCard';
import HeatmapViewer from './HeatmapViewer';

const Results = ({ result, originalUrl }) => {
  if (!result) return null;

  return (
    <div className="space-y-6">
      <ScoreCard trustScore={result.trust_score} />
      
      <HeatmapViewer 
        originalUrl={originalUrl} 
        heatmapUrl={result.heatmap_url} 
      />
      
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '1rem' }}>
          Analysis Reasons
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {result.reasons.map((reason, idx) => (
            <li key={idx} style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              ✗ {reason}
            </li>
          ))}
        </ul>
      </div>
      
      {result.report_url && (
        <div style={{ textAlign: 'center' }}>
          <a href={result.report_url} download className="btn-primary">
            Download PDF Report
          </a>
        </div>
      )}
    </div>
  );
};

export default Results;