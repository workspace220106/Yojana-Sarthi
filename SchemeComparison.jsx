import React from 'react';
import './SchemeComparison.css';

const SchemeComparison = () => {
  const schemes = [
    { name: 'PM-KISAN', category: 'Agriculture', benefit: '₹6,000 / year', eligibility: 'Small farmers', priority: 'High' },
    { name: 'RAITHU BANDHU', category: 'Agriculture', benefit: '₹10,000 / acre', eligibility: 'Landowners', priority: 'Medium' },
    { name: 'KCC LOAN', category: 'Credit', benefit: 'Low interest', eligibility: 'Active farmers', priority: 'Low' }
  ];

  return (
    <div className="comparison-page">
      <h1>Scheme Comparison</h1>
      <div className="comparison-grid">
        <div className="compare-column headers">
          <div className="header-cell">Scheme Name</div>
          <div className="header-cell">Benefit Amount</div>
          <div className="header-cell">Eligibility</div>
          <div className="header-cell">Priority</div>
        </div>
        
        {schemes.map((scheme, i) => (
          <div key={i} className="compare-column data">
            <div className="data-cell scheme-name">
              <strong>{scheme.name}</strong>
              <span>{scheme.category}</span>
            </div>
            <div className="data-cell benefit">{scheme.benefit}</div>
            <div className="data-cell">{scheme.eligibility}</div>
            <div className="data-cell">
              <span className={`priority-badge ${scheme.priority.toLowerCase()}`}>
                {scheme.priority} Priority
              </span>
            </div>
            <button className="btn-select">Select</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemeComparison;
