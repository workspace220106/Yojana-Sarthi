import React from 'react';
import './BenefitPlanner.css';

const BenefitPlanner = () => {
  const lifecycle = [
    { stage: 'Birth / Early Years', status: 'Completed', color: 'success', age: '0-5' },
    { stage: 'Education', status: 'Current', color: 'secondary', age: '6-21' },
    { stage: 'Livelihood & Skills', status: 'Next Phase', color: 'muted', age: '22-50' },
    { stage: 'Social Security', status: 'Planned', color: 'muted', age: '50+' }
  ];

  return (
    <div className="planner-page">
      <h1>Benefit Lifecycle Planner</h1>
      <div className="timeline">
        {lifecycle.map((item, i) => (
          <div key={i} className={`timeline-item ${item.status.toLowerCase().replace(' ', '-')}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="age-tag">{item.age} years</span>
              <h3>{item.stage}</h3>
              <p className="status-label">{item.status}</p>
              {item.status === 'Current' && (
                <div className="current-opportunities">
                  <p>You have <strong>4 active education schemes</strong> ready for renewal.</p>
                  <button className="btn-action">Optimise Now</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitPlanner;
