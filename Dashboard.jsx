import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <div className="card eligibility-score-card">
          <h3>Eligibility Score</h3>
          <div className="score-viz">
            <div className="ring-outer">
              <div className="ring-inner">
                <span className="score-val">840</span>
                <span className="score-label">Excellent</span>
              </div>
            </div>
          </div>
          <p>You are eligible for 12 new schemes this month.</p>
        </div>

        <div className="card benefit-summary-card">
          <h3>Benefit Distribution</h3>
          <div className="chart-placeholder pie-chart">
            {/* Visual representation of a pie chart */}
            <div className="pie-segment s1"></div>
            <div className="pie-segment s2"></div>
            <div className="pie-segment s3"></div>
          </div>
          <div className="chart-legend">
            <span>🔵 Education (45%)</span>
            <span>🟢 Agriculture (30%)</span>
            <span>🟡 Direct Cash (25%)</span>
          </div>
        </div>

        <div className="card activity-card">
          <h3>Application Status</h3>
          <div className="bar-chart">
            {[60, 80, 40, 90, 70].map((h, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar-fill" style={{ height: `${h}%` }}></div>
                <span>M{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="section-title">Recommended Schemes</h2>
      <div className="scheme-list">
        {[
          { name: 'PM-KISAN Samman Nidhi', conf: 98, status: 'Pre-Approved' },
          { name: 'Ayushman Bharat Digital', conf: 85, status: 'Ready to Apply' },
          { name: 'National Scholarship Portal', conf: 72, status: 'Review Needed' }
        ].map(scheme => (
          <div key={scheme.name} className="scheme-card">
            <div className="scheme-info">
              <h4>{scheme.name}</h4>
              <span className={`status-badge ${scheme.status.toLowerCase().replace(/ /g, '-')}`}>
                {scheme.status}
              </span>
            </div>
            <div className="confidence-meter">
              <div className="meter-label">Match Confidence: {scheme.conf}%</div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${scheme.conf}%` }}></div>
              </div>
            </div>
            <button className="btn-view-details">View Details →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
