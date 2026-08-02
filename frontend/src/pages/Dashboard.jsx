import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Send
} from 'lucide-react';
import './Dashboard.css';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);

  const fetchComplaints = async (uid) => {
    try {
      const q = query(collection(db, "support_queries"), where("citizen_id", "==", uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMyComplaints(list);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('yojana_sarthi_profile');
    const savedDocs = localStorage.getItem('yojana_sarthi_docs');
    const savedUser = localStorage.getItem('yojana_sarthi_current_user');
    
    let parsedProfile = null;
    let parsedDocs = [];
    let userId = '';

    if (savedProfile) {
      parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
    if (savedDocs) {
      parsedDocs = JSON.parse(savedDocs);
      setDocuments(parsedDocs);
    }
    if (savedUser) {
      userId = JSON.parse(savedUser).uid;
      fetchComplaints(userId);
    }

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

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const savedUser = localStorage.getItem('yojana_sarthi_current_user');
    if (!savedUser) {
      alert("Please log in to submit a complaint");
      return;
    }
    const user = JSON.parse(savedUser);

    setSubmittingComplaint(true);
    try {
      await addDoc(collection(db, "support_queries"), {
        citizen_id: user.uid,
        citizen_name: profile?.fullName || user.fullName || 'Citizen',
        message: complaintText,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        response: ''
      });
      setComplaintText('');
      alert("Grievance submitted successfully!");
      fetchComplaints(user.uid);
    } catch (err) {
      console.error(err);
      alert("Failed to submit grievance.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

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

      {/* Citizen Grievance & Support Helpdesk Section */}
      <div className="section-block support-helpdesk-block" style={{ marginTop: '2rem' }}>
        <div className="block-header">
          <h2>Grievance & FAQ Support Helpdesk</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
            Submit questions, complaints, or feedback directly to the administrators.
          </p>
        </div>

        <div className="support-helpdesk-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          {/* Submit Form */}
          <div className="support-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#003580', borderBottom: '1px solid #edf2f7', paddingBottom: '8px', marginBottom: '1rem' }}>
              Submit a New Grievance / Question
            </h3>
            <form onSubmit={handleSubmitComplaint}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>
                  Write your complaint or query:
                </label>
                <textarea
                  placeholder="e.g. My Aadhaar verification failed, or how long does the process take?"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e0',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={submittingComplaint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#003580',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <Send size={16} />
                <span>{submittingComplaint ? 'Submitting...' : 'Submit to Admin Portal'}</span>
              </button>
            </form>
          </div>

          {/* History of complaints */}
          <div className="support-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#003580', borderBottom: '1px solid #edf2f7', paddingBottom: '8px', marginBottom: '1rem' }}>
              Your Support & Grievance History
            </h3>
            <div className="complaint-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myComplaints.length > 0 ? (
                myComplaints.map((c) => (
                  <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#718096', marginBottom: '6px' }}>
                      <span>{new Date(c.timestamp).toLocaleString()}</span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '10px',
                        background: c.status === 'Resolved' ? '#c6f6d5' : '#feebc8',
                        color: c.status === 'Resolved' ? '#22543d' : '#744210',
                        fontWeight: '700'
                      }}>{c.status}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#2d3748' }}>Q: {c.message}</p>
                    {c.response ? (
                      <div style={{ borderTop: '1px dashed #cbd5e0', marginTop: '8px', paddingTop: '8px', color: '#2b6cb0', fontSize: '0.85rem' }}>
                        <strong>Admin Response:</strong> {c.response}
                      </div>
                    ) : (
                      <div style={{ borderTop: '1px dashed #cbd5e0', marginTop: '8px', paddingTop: '8px', color: '#a0aec0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Awaiting response from administrator...
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem', marginTop: '2rem' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  No grievances submitted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
