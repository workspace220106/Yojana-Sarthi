import React from 'react';
import './RejectionPredictor.css';

const RejectionPredictor = () => {
  const issues = [
    { title: 'Income Mismatch', severity: 'High', msg: 'The income certificate in DigiLocker (₹4.2L) exceeds the scheme threshold (₹3.5L).', fix: 'Update income certificate or apply for non-marginal schemes.' },
    { title: 'Incomplete Address', severity: 'Medium', msg: 'House number is missing in the primary profile.', fix: 'Complete your profile details in the Profile tab.' },
    { title: 'Missing Document', severity: 'Low', msg: 'Land record map (Pahani) is optional but recommended.', fix: 'Upload current year Pahani for faster approval.' }
  ];

  return (
    <div className="predictor-page">
      <div className="risk-header">
        <div className="risk-assessment">
          <div className="risk-level high">
            <span className="risk-pct">65%</span>
            <span className="risk-label">Rejection Risk</span>
          </div>
          <p>Based on our AI analysis of your application for <strong>PM-SVANidhi</strong>.</p>
        </div>
      </div>

      <div className="issues-list">
        <h2>Identified Issues ({issues.length})</h2>
        {issues.map((issue, i) => (
          <div key={i} className={`issue-card ${issue.severity.toLowerCase()}`}>
            <div className="issue-header">
              <span className="severity-badge">{issue.severity} Severity</span>
              <h3>{issue.title}</h3>
            </div>
            <p className="issue-msg">{issue.msg}</p>
            <div className="fix-box">
              <strong>Recommended Fix:</strong>
              <p>{issue.fix}</p>
            </div>
            <button className="btn-fix">Resolve Issue Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectionPredictor;
