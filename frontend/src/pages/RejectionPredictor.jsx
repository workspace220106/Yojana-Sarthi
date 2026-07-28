import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './RejectionPredictor.css';

const RejectionPredictor = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('yojana_sarthi_profile');
    const savedDocs = localStorage.getItem('yojana_sarthi_docs');
    
    let parsedProfile = null;
    let parsedDocs = [];

    if (savedProfile) {
      parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
    if (savedDocs) {
      parsedDocs = JSON.parse(savedDocs);
      setDocuments(parsedDocs);
    }

    // Generate real issues based on saved data
    const generatedIssues = [];

    if (!parsedProfile || !parsedProfile.fullName) {
      generatedIssues.push({
        title: 'Incomplete Profile Name',
        severity: 'High',
        msg: 'Your full name is not configured in your profile. Many scheme forms will fail validation.',
        fix: 'Go to Citizen Profile and enter your full name.'
      });
    }

    if (!parsedProfile || !parsedProfile.aadhaar) {
      generatedIssues.push({
        title: 'Missing Aadhaar Linkage',
        severity: 'High',
        msg: 'Aadhaar validation number is required for Direct Benefit Transfer verification.',
        fix: 'Go to Citizen Profile and fill in your Aadhaar number.'
      });
    }

    if (!parsedProfile || !parsedProfile.income) {
      generatedIssues.push({
        title: 'Missing Annual Income',
        severity: 'Medium',
        msg: 'Welfare schemes need income values to calculate margin eligibility.',
        fix: 'Configure annual household income in your profile.'
      });
    } else if (Number(parsedProfile.income) > 800000) {
      generatedIssues.push({
        title: 'Above Non-Creamy Layer Ceiling',
        severity: 'Medium',
        msg: 'Your income exceeds ₹8 Lakhs. You will be disqualified from OBC/EWS reservation schemes.',
        fix: 'Ensure your income tax records match the reported income.'
      });
    }

    if (parsedDocs.length === 0) {
      generatedIssues.push({
        title: 'No Documents Uploaded',
        severity: 'High',
        msg: 'No certificates found in your vault. Welfare applications require at least Aadhaar and Income certificates.',
        fix: 'Upload documents in the Profile Vault.'
      });
    } else {
      const hasIncomeCert = parsedDocs.some(d => d.name.toLowerCase().includes('income'));
      if (!hasIncomeCert) {
        generatedIssues.push({
          title: 'Missing Income Certificate',
          severity: 'Medium',
          msg: 'You have not uploaded a verified Income Certificate to substantiate your profile income.',
          fix: 'Upload or link your current financial year Income Certificate.'
        });
      }
    }

    setIssues(generatedIssues);
  }, []);

  const riskLevel = issues.length > 2 ? 'High' : issues.length > 0 ? 'Medium' : 'Low';
  const riskClass = riskLevel.toLowerCase();

  return (
    <div className="predictor-page">
      <div className="risk-header">
        <div className="risk-assessment">
          <div className={`risk-level ${riskClass}`}>
            <span className="risk-pct">{issues.length * 20}%</span>
            <span className="risk-label">{riskLevel} Rejection Risk</span>
          </div>
          <p>Real-time application audit for citizen profile eligibility rule verification.</p>
        </div>
      </div>

      <div className="issues-list">
        <h2>Detected Validation Issues ({issues.length})</h2>
        {issues.length > 0 ? (
          issues.map((issue, i) => (
            <div key={i} className={`issue-card ${issue.severity.toLowerCase()}`}>
              <div className="issue-header">
                <span className="severity-badge">{issue.severity} Severity</span>
                <h3>{issue.title}</h3>
              </div>
              <p className="issue-msg">{issue.msg}</p>
              <div className="fix-box">
                <strong>Recommended Action:</strong>
                <p>{issue.fix}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-issues-card">
            <CheckCircle size={32} className="icon-success" />
            <h3>Your Profile is Fully Compliant</h3>
            <p>We found 0 issues. You are ready to apply for all eligible schemes with very low rejection risk!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectionPredictor;
