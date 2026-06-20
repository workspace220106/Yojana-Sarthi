import React from 'react';
import './DocumentAdvisor.css';

const DocumentAdvisor = () => {
  const documents = [
    { name: 'Income Certificate', status: 'Expiring Soon', impact: 'High', days: 12, color: 'warning' },
    { name: 'Caste Certificate', status: 'Verified', impact: 'Medium', days: null, color: 'success' },
    { name: 'Property Tax Receipt', status: 'Missing', impact: 'Critical', days: 0, color: 'danger' }
  ];

  return (
    <div className="document-advisor-page">
      <div className="advisor-header">
        <div className="impact-tracker">
          <h3>Health Score: 72/100</h3>
          <div className="impact-bar">
            <div className="impact-fill" style={{ width: '72%' }}></div>
          </div>
          <p>3 documents need your attention to maintain full eligibility.</p>
        </div>
      </div>

      <div className="docs-grid">
        {documents.map((doc, i) => (
          <div key={i} className={`doc-status-card ${doc.color}`}>
            <div className="doc-icon">📄</div>
            <div className="doc-details">
              <h4>{doc.name}</h4>
              <p className="status-text">{doc.status} {doc.days ? `(${doc.days} days left)` : ''}</p>
              <span className="impact-badge">Impact: {doc.impact}</span>
            </div>
            <div className="doc-actions">
              <button className="btn-renew">Renew/Upload</button>
            </div>
          </div>
        ))}
      </div>

      <div className="guidance-panel">
        <h3>Pro-Tip AI Guidance</h3>
        <p>Updating your <strong>Property Tax Receipt</strong> will unlock 4 housing schemes worth up to ₹2.5L in subsidies.</p>
        <button className="btn-guide">How to get this doc?</button>
      </div>
    </div>
  );
};

export default DocumentAdvisor;
