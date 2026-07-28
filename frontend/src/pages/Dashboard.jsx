import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

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

    // Fetch recommended schemes from Flask backend using real profile parameters
    const fetchRecommendations = async () => {
      if (!parsedProfile) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (parsedProfile.age) params.append('age', parsedProfile.age);
        if (parsedProfile.income) params.append('income', parsedProfile.income);
        if (parsedProfile.occupation && parsedProfile.occupation !== 'All') params.append('occupation', parsedProfile.occupation);
        if (parsedProfile.category && parsedProfile.category !== 'All') params.append('category', parsedProfile.category);
        if (parsedProfile.gender && parsedProfile.gender !== 'All') params.append('gender', parsedProfile.gender);

        const res = await fetch(`/api/schemes?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // Take top 3 recommended schemes
          setRecommendedSchemes(data.eligible.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Calculate dynamic eligibility score (max 1000)
  const calculateScore = () => {
    if (!profile) return 200; // Base score
    let score = 200;
    if (profile.fullName) score += 150;
    if (profile.aadhaar) score += 150;
    if (profile.phone) score += 100;
    if (profile.age) score += 100;
    if (profile.income) score += 100;
    if (profile.occupation && profile.occupation !== 'All') score += 50;
    if (profile.category && profile.category !== 'All') score += 50;
    if (profile.gender && profile.gender !== 'All') score += 50;
    
    // Add document bonus
    score += documents.length * 50;
    return Math.min(score, 1000);
  };

  const currentScore = calculateScore();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Citizen Eligibility Overview</h1>
          <p className="dashboard-sub">
            {profile?.fullName ? `Welcome back, ${profile.fullName}!` : 'Configure your citizen profile to begin.'}
          </p>
        </div>
        <div className="dbt-status-pill">
          <ShieldCheck size={16} />
          <span>DBT Status: {profile?.aadhaar ? 'Verified Linkage' : 'Aadhaar Pending'}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Score Card */}
        <div className="card eligibility-score-card">
          <div className="card-header">
            <h3>Profile Completeness Score</h3>
            <span className="badge-score">{currentScore > 750 ? 'Excellent' : 'Incomplete'}</span>
          </div>
          <div className="score-viz">
            <div className="ring-outer" style={{
              background: `conic-gradient(#003580 0% ${(currentScore/1000)*100}%, #e2e8f0 ${(currentScore/1000)*100}% 100%)`
            }}>
              <div className="ring-inner">
                <span className="score-val">{currentScore}</span>
                <span className="score-max">/1000</span>
              </div>
            </div>
          </div>
          <p className="score-desc">
            <CheckCircle2 size={16} className="icon-check" />
            Active details match against scheme eligibility criteria.
          </p>
        </div>

        {/* Saved Documents Info Card */}
        <div className="card benefit-summary-card">
          <div className="card-header">
            <h3>Saved Documents Vault</h3>
          </div>
          <div className="docs-summary-info">
            <span className="large-count-val">{documents.length}</span>
            <p className="info-desc-txt">Document(s) successfully verified and active in your local wallet.</p>
          </div>
          <div className="documents-status-bullet">
            {documents.length > 0 ? (
              documents.slice(0, 3).map((d, i) => (
                <div key={i} className="bullet-row">● {d.name}</div>
              ))
            ) : (
              <div className="bullet-row warning">● No documents uploaded yet</div>
            )}
          </div>
        </div>

        {/* Claim Info Card */}
        <div className="card activity-card">
          <div className="card-header">
            <h3>Disbursement Verification</h3>
            <span className="growth-tag">Secure System</span>
          </div>
          <div className="disb-info-body">
            <p>Direct Benefit Transfer (DBT) is cleared via Aadhaar Bridge Payment System (ABPS) upon scheme approval.</p>
            <div className="dbt-clearing-status">
              <span>Aadhaar Link Status:</span>
              <strong>{profile?.aadhaar ? 'LINKED' : 'NOT LINKED'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Schemes */}
      <div className="section-block">
        <div className="block-header">
          <h2>Your Top Matching Schemes</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Evaluating scheme rules...</p>
          </div>
        ) : (
          <div className="scheme-list">
            {recommendedSchemes.length > 0 ? (
              recommendedSchemes.map((scheme, idx) => (
                <div key={idx} className="scheme-card-dash">
                  <div className="dash-card-left">
                    <div className="scheme-meta-tags">
                      {scheme.level && <span className="tag-type">{scheme.level}</span>}
                      <span className="tag-cat">{scheme.schemeCategory || 'General Welfare'}</span>
                    </div>
                    <h4>{scheme.scheme_name}</h4>
                    {scheme.benefits && <p className="benefit-text">Benefit: <strong>{scheme.benefits}</strong></p>}
                  </div>

                  <div className="dash-card-right">
                    <div className="confidence-meter">
                      <div className="meter-label">Passed Parameters: <strong>{scheme.passed_reasons?.length || 0}</strong></div>
                    </div>
                    <button className="btn-view-details">
                      <span>Apply for Scheme</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-recommendations">
                <AlertCircle size={32} />
                <p>No recommendations. Please go to the Citizen Profile tab and complete your profile parameters to auto-match schemes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
