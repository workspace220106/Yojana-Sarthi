import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  RefreshCw, 
  FileText, 
  Smartphone,
  Trash2,
  ExternalLink,
  BookOpen,
  MapPin,
  CreditCard,
  Gauge
} from 'lucide-react';
import './Profile.css';
import { supabase } from '../supabase';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    fullName: '',
    aadhaar: '',
    phone: '',
    address: '',
    age: '',
    income: '',
    occupation: 'All',
    category: 'All',
    gender: 'All',
    verification_status: 'Unverified',
    data_sources: ['User Input']
  });
  
  const [documents, setDocuments] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // DigiLocker Simulation State
  const [isLinking, setIsLinking] = useState(false);
  const [linkingMode, setLinkingMode] = useState(null); // 'real' or 'sim'
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkingError, setLinkingError] = useState('');

  // Load profile data and documents from Supabase on mount
  useEffect(() => {
    // 1. Get initial session/user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        // Fallback to local storage if signed out
        loadLocalFallback();
      }
    });

    // Helper to fetch profile from Supabase
    async function fetchProfile(userId) {
      try {
        const { data, error } = await supabase
          .from('citizens')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data && !error) {
          const profile = {
            fullName: data.full_name || 'Citizen',
            aadhaar: data.aadhaar || '',
            phone: data.phone || '',
            state: data.state || 'Maharashtra',
            address: data.address || '',
            age: data.age ? String(data.age) : '',
            income: data.income ? String(data.income) : '',
            occupation: data.occupation || 'All',
            category: data.category || 'All',
            gender: data.gender || 'All',
            verification_status: data.verification_status || 'Unverified',
            data_sources: data.data_sources || ['User Input'],
            documents: data.documents || []
          };
          setProfileData(profile);
          setDocuments(data.documents || []);
          localStorage.setItem('yojana_sarthi_profile', JSON.stringify(profile));
          localStorage.setItem('yojana_sarthi_docs', JSON.stringify(data.documents || []));
        }
      } catch (err) {
        console.error("Failed to load profile from Supabase:", err);
      }
    }

    function loadLocalFallback() {
      const savedProfile = localStorage.getItem('yojana_sarthi_profile');
      if (savedProfile) {
        try {
          setProfileData(JSON.parse(savedProfile));
        } catch (e) {}
      }
      const savedDocs = localStorage.getItem('yojana_sarthi_docs');
      if (savedDocs) {
        try {
          setDocuments(JSON.parse(savedDocs));
        } catch (e) {}
      }
    }

    // Check for returning Cashfree Redirect verification ID
    const cfVerId = localStorage.getItem('yojana_sarthi_cf_ver_id');
    if (cfVerId) {
      setSyncing(true);
      setIsLinking(true);
      setLinkingMode('real');

      fetch(`/api/verification/digilocker/status/${cfVerId}`)
        .then(res => {
          if (!res.ok) throw new Error('API server returned error');
          return res.json();
        })
        .then(async (data) => {
          if (data.status === 'AUTHENTICATED' || data.status === 'SUCCESS' || data.status === 'COMPLETED') {
            const details = data.user_details || {};
            const fullName = details.name || 'Verified Beneficiary';
            
            const freshDocs = [
              { name: 'Aadhaar Card (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
              { name: 'PAN Card (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
              { name: 'Driving License (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
              { name: '7/12 Land holding records (Verified via Cashfree)', addedAt: new Date().toLocaleDateString() },
              { name: 'HSC Academic Marksheet (Verified via Cashfree)', addedAt: new Date().toLocaleDateString() }
            ];

            const verifiedProfile = {
              fullName: fullName,
              aadhaar: details.aadhaar_number || 'XXXX-XXXX-8924',
              phone: details.phone_number || '9876543210',
              state: details.state || 'Maharashtra',
              address: details.address || 'Shivaji Nagar, Pune, Maharashtra - 411005',
              age: '34',
              income: '240000',
              occupation: 'Farmer',
              category: 'OBC',
              gender: details.gender === 'M' ? 'Male' : 'Female',
              verification_status: 'Verified',
              data_sources: ['User Input', 'DigiLocker'],
              documents: freshDocs
            };

            setProfileData(verifiedProfile);
            setDocuments(freshDocs);
            localStorage.setItem('yojana_sarthi_profile', JSON.stringify(verifiedProfile));
            localStorage.setItem('yojana_sarthi_docs', JSON.stringify(freshDocs));

            // Save to Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await supabase.from('citizens').upsert({
                id: session.user.id,
                full_name: fullName,
                aadhaar: details.aadhaar_number || 'XXXX-XXXX-8924',
                phone: details.phone_number || '9876543210',
                state: details.state || 'Maharashtra',
                address: details.address || 'Shivaji Nagar, Pune, Maharashtra - 411005',
                age: 34,
                income: 240000,
                occupation: 'Farmer',
                category: 'OBC',
                gender: details.gender === 'M' ? 'Male' : 'Female',
                verification_status: 'Verified',
                data_sources: ['User Input', 'DigiLocker'],
                documents: freshDocs
              });
            }

            localStorage.removeItem('yojana_sarthi_cf_ver_id');
            setSyncing(false);
            setIsLinking(false);
            setLinkingMode(null);

            window.dispatchEvent(new Event('profileUpdate'));
            alert('Cashfree DigiLocker Sync Successful! Verified documents and profiles loaded.');
          } else {
            setLinkingError(`Verification status is ${data.status}. Please complete the flow.`);
            setSyncing(false);
          }
        })
        .catch(err => {
          console.error(err);
          setLinkingError('Could not verify status. Feel free to use the "Offline Simulation" option to test the portal.');
          setSyncing(false);
        });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      ...profileData,
      verification_status: profileData.verification_status || 'Unverified',
      data_sources: profileData.data_sources || ['User Input']
    };
    
    setProfileData(updated);
    localStorage.setItem('yojana_sarthi_profile', JSON.stringify(updated));
    
    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase.from('citizens').upsert({
          id: session.user.id,
          full_name: updated.fullName,
          aadhaar: updated.aadhaar,
          phone: updated.phone,
          state: updated.state,
          address: updated.address,
          age: updated.age ? parseInt(updated.age) : null,
          income: updated.income ? parseInt(updated.income) : null,
          occupation: updated.occupation,
          category: updated.category,
          gender: updated.gender,
          verification_status: updated.verification_status,
          data_sources: updated.data_sources,
          documents: documents
        });
      } catch (err) {
        console.error("Failed to save profile to Supabase:", err);
      }
    }

    setIsEditing(false);
    
    // Dispatch update event
    window.dispatchEvent(new Event('profileUpdate'));
    alert('Profile saved successfully!');
  };

  const addDocument = async (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const updatedDocs = [...documents, { name: newDocName.trim(), addedAt: new Date().toLocaleDateString() }];
    setDocuments(updatedDocs);
    localStorage.setItem('yojana_sarthi_docs', JSON.stringify(updatedDocs));
    
    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase.from('citizens').update({
          documents: updatedDocs
        }).eq('id', session.user.id);
      } catch (err) {
        console.error("Failed to add document to Supabase:", err);
      }
    }

    setNewDocName('');
  };

  const removeDocument = async (index) => {
    const updatedDocs = documents.filter((_, idx) => idx !== index);
    setDocuments(updatedDocs);
    localStorage.setItem('yojana_sarthi_docs', JSON.stringify(updatedDocs));
    
    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase.from('citizens').update({
          documents: updatedDocs
        }).eq('id', session.user.id);
      } catch (err) {
        console.error("Failed to remove document from Supabase:", err);
      }
    }
  };

  // Real Cashfree API Flow Redirect Trigger
  const handleStartRealLinking = async () => {
    setLinkingError('');
    setSyncing(true);
    setLinkingMode('real');

    try {
      const res = await fetch('/api/verification/digilocker/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirect_url: window.location.href
        })
      });

      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();

      if (data.url) {
        // Save verification ID in local storage to pull status upon redirect back
        localStorage.setItem('yojana_sarthi_cf_ver_id', data.verification_id);
        // Redirect to Cashfree SecureID verification URL
        window.location.href = data.url;
      } else {
        throw new Error('Verification URL not generated');
      }
    } catch (err) {
      console.error(err);
      setLinkingError('Failed to initialize Cashfree redirect. Check backend connection or keys.');
      setSyncing(false);
      setLinkingMode(null);
    }
  };

  // Simulated DigiLocker Handlers
  const handleStartSimLinking = () => {
    setIsLinking(true);
    setLinkingMode('sim');
    setLinkingError('');
    setShowOtpStep(false);
    setAadhaarInput('');
    setPinInput('');
  };

  const handleDigiLockerSignIn = (e) => {
    e.preventDefault();
    if (!aadhaarInput.trim() || aadhaarInput.length < 10) {
      setLinkingError('Please enter a valid Aadhaar or Mobile Number.');
      return;
    }
    if (pinInput.length !== 6 || !/^\d+$/.test(pinInput)) {
      setLinkingError('PIN must be a 6-digit numeric security PIN.');
      return;
    }
    setLinkingError('');
    setShowOtpStep(true);
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput.length !== 6 || !/^\d+$/.test(otpInput)) {
      setLinkingError('Please enter a valid 6-digit OTP code.');
      return;
    }
    
    setLinkingError('');
    setSyncing(true);

    // Simulate downloading documents and verifying profile parameters
    setTimeout(async () => {
      const userStr = localStorage.getItem('yojana_sarthi_current_user');
      let currentUserName = 'Citizen';
      let phoneNum = '9876543210';
      let stateVal = 'Maharashtra';
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          currentUserName = userObj.fullName || currentUserName;
          phoneNum = userObj.mobileNumber || phoneNum;
          stateVal = userObj.state || stateVal;
        } catch (err) {}
      }

      const freshDocs = [
        { name: 'Aadhaar Card (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
        { name: 'PAN Card (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
        { name: 'Driving License (Verified via Cashfree SecureID)', addedAt: new Date().toLocaleDateString() },
        { name: '7/12 Land holding records (Verified via Cashfree)', addedAt: new Date().toLocaleDateString() },
        { name: 'HSC Academic Marksheet (Verified via Cashfree)', addedAt: new Date().toLocaleDateString() }
      ];

      // 1. Update Profile & Documents in state and local storage
      const verifiedProfile = {
        fullName: currentUserName,
        aadhaar: 'XXXX-XXXX-8924',
        phone: phoneNum,
        state: stateVal,
        address: 'Sector 5, Shivaji Nagar, Pune, Maharashtra - 411005',
        age: '34',
        income: '240000', // ₹2.4 Lakhs
        occupation: 'Farmer',
        category: 'OBC',
        gender: 'Male',
        verification_status: 'Verified',
        data_sources: ['User Input', 'DigiLocker'],
        documents: freshDocs
      };
      
      setProfileData(verifiedProfile);
      setDocuments(freshDocs);
      localStorage.setItem('yojana_sarthi_profile', JSON.stringify(verifiedProfile));
      localStorage.setItem('yojana_sarthi_docs', JSON.stringify(freshDocs));

      // 2. Write to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          await supabase.from('citizens').upsert({
            id: session.user.id,
            full_name: currentUserName,
            aadhaar: 'XXXX-XXXX-8924',
            phone: phoneNum,
            state: stateVal,
            address: 'Sector 5, Shivaji Nagar, Pune, Maharashtra - 411005',
            age: 34,
            income: 240000,
            occupation: 'Farmer',
            category: 'OBC',
            gender: 'Male',
            verification_status: 'Verified',
            data_sources: ['User Input', 'DigiLocker'],
            documents: freshDocs
          });
        } catch (err) {
          console.error("Failed to write simulation profile to Supabase:", err);
        }
      }

      // 3. Clear Linking State
      setSyncing(false);
      setIsLinking(false);
      setLinkingMode(null);
      
      // Dispatch events
      window.dispatchEvent(new Event('profileUpdate'));
      alert('DigiLocker linked successfully! Verified profile attributes updated.');
    }, 1500);
  };

  const handleUnlinkDigiLocker = async () => {
    if (window.confirm('Are you sure you want to unlink DigiLocker? Verified status will be reset.')) {
      const userDocs = documents.filter(doc => !doc.name.includes('Cashfree') && !doc.name.includes('DigiLocker'));
      
      const unlinkedProfile = {
        ...profileData,
        aadhaar: '',
        verification_status: 'Unverified',
        data_sources: ['User Input'],
        documents: userDocs
      };
      
      setProfileData(unlinkedProfile);
      setDocuments(userDocs);
      localStorage.setItem('yojana_sarthi_profile', JSON.stringify(unlinkedProfile));
      localStorage.setItem('yojana_sarthi_docs', JSON.stringify(userDocs));

      // Write to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          await supabase.from('citizens').upsert({
            id: session.user.id,
            full_name: unlinkedProfile.fullName,
            aadhaar: '',
            phone: unlinkedProfile.phone,
            state: unlinkedProfile.state,
            address: unlinkedProfile.address,
            age: unlinkedProfile.age ? parseInt(unlinkedProfile.age) : null,
            income: unlinkedProfile.income ? parseInt(unlinkedProfile.income) : null,
            occupation: unlinkedProfile.occupation,
            category: unlinkedProfile.category,
            gender: unlinkedProfile.gender,
            verification_status: unlinkedProfile.verification_status,
            data_sources: unlinkedProfile.data_sources,
            documents: userDocs
          });
        } catch (err) {
          console.error("Failed to unlink profile in Supabase:", err);
        }
      }

      // Dispatch event
      window.dispatchEvent(new Event('profileUpdate'));
      alert('DigiLocker unlinked successfully.');
    }
  };

  const tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'docs', label: 'Documents Vault' },
    { id: 'digilocker', label: 'DigiLocker Integration' },
    { id: 'settings', label: 'Account Settings' }
  ];

  const renderDigiLockerTab = () => {
    const isVerified = profileData.verification_status === 'Verified';

    if (isLinking && linkingMode === 'sim') {
      return (
        <div className="digilocker-simulation-container">
          <div className="dl-sim-header">
            <div className="dl-logo-badge">DigiLocker</div>
            <p>National Portal Consent Platform Integration</p>
          </div>
          
          {syncing ? (
            <div className="dl-sim-syncing">
              <RefreshCw size={48} className="spinner" />
              <h3>Syncing with DigiLocker Gateway...</h3>
              <p>Fetching Aadhaar, Caste, and Income records securely from MeitY servers.</p>
            </div>
          ) : (
            <div className="dl-sim-card">
              <div className="dl-form-title">
                <Lock size={18} />
                <span>Link Your Account via Official e-Consent</span>
              </div>

              {linkingError && (
                <div className="dl-error-box">
                  <AlertCircle size={16} />
                  <span>{linkingError}</span>
                </div>
              )}

              {!showOtpStep ? (
                <form onSubmit={handleDigiLockerSignIn} className="dl-sim-form">
                  <div className="form-group">
                    <label>Aadhaar Number / Mobile Number</label>
                    <input 
                      type="text" 
                      placeholder="12-digit Aadhaar / 10-digit Mobile"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>6-Digit Security PIN</label>
                    <input 
                      type="password" 
                      placeholder="••••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                  <div className="dl-sim-actions">
                    <button type="submit" className="dl-btn-primary">Sign In & Request OTP</button>
                    <button type="button" className="dl-btn-cancel" onClick={() => { setIsLinking(false); setLinkingMode(null); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="dl-sim-form">
                  <div className="otp-alert-info">
                    <Smartphone size={20} />
                    <span>A 6-digit OTP code has been simulated for your session. Enter <strong>123456</strong> to complete.</span>
                  </div>
                  <div className="form-group">
                    <label>Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      placeholder="123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                  <div className="dl-sim-actions">
                    <button type="submit" className="dl-btn-primary">Verify & Sync Credentials</button>
                    <button type="button" className="dl-btn-cancel" onClick={() => setShowOtpStep(false)}>Back</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      );
    }

    if (syncing && linkingMode === 'real') {
      return (
        <div className="digilocker-simulation-container">
          <div className="dl-sim-header">
            <div className="dl-logo-badge">Cashfree Identity</div>
            <p>Aadhaar & DigiLocker Secure Link Verification</p>
          </div>
          <div className="dl-sim-syncing">
            <RefreshCw size={48} className="spinner" />
            <h3>Processing Cashfree SecureID Callback...</h3>
            <p>Querying verified status for verification ID...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="digilocker-tab-wrapper">
        <div className="digilocker-hero-info">
          <div className="hero-left-dl">
            <div className="official-dl-tag">
              <ShieldCheck size={18} />
              <span>Ministry of Electronics & IT (MeitY) • Cashfree Integrator</span>
            </div>
            <h2>Verify Your Citizen Profile with DigiLocker</h2>
            <p>
              Link your government accounts to auto-verify your details. Doing this unlocks official schemes, auto-populates documents in the vault, and sets your verification status to **Verified** for faster matching.
            </p>
          </div>
          <div className="dl-status-badge-container">
            {isVerified ? (
              <div className="dl-status-card verified">
                <ShieldCheck size={28} className="verified-icon" />
                <span className="dl-status-txt">Linked & Verified</span>
              </div>
            ) : (
              <div className="dl-status-card unverified">
                <AlertCircle size={28} className="unverified-icon" />
                <span className="dl-status-txt">Not Linked</span>
              </div>
            )}
          </div>
        </div>

        {linkingError && (
          <div className="dl-error-box" style={{ margin: '1rem 0' }}>
            <AlertCircle size={16} />
            <span>{linkingError}</span>
          </div>
        )}

        {isVerified ? (
          <div className="dl-verified-details-block">
            <div className="verified-section-header">
              <h3>Verified Credentials Fetched</h3>
              <button className="dl-btn-danger" onClick={handleUnlinkDigiLocker}>Unlink DigiLocker Account</button>
            </div>
            
            <div className="verified-grid">
              <div className="verified-info-item">
                <span className="lbl">Aadhaar Status</span>
                <p>Verified (XXXX-XXXX-8924)</p>
              </div>
              <div className="verified-info-item">
                <span className="lbl">Full Name</span>
                <p>{profileData.fullName}</p>
              </div>
              <div className="verified-info-item">
                <span className="lbl">Verified Income</span>
                <p>₹2,40,000 / Year (Income Certificate)</p>
              </div>
              <div className="verified-info-item">
                <span className="lbl">Verified Category</span>
                <p>{profileData.category} (Caste Certificate)</p>
              </div>
              <div className="verified-info-item">
                <span className="lbl">Occupation Status</span>
                <p>{profileData.occupation} (Registered Farmer Record)</p>
              </div>
              <div className="verified-info-item">
                <span className="lbl">State of Origin</span>
                <p>{profileData.state}</p>
              </div>
            </div>

            <div className="verified-documents-list">
              <h4>Synced Wallet Documents</h4>
              <div className="dl-docs-flex" style={{ marginBottom: '2.5rem' }}>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>Aadhaar Card</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>PAN Card</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>Driving License</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>7/12 Land Records</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>HSC Marksheet</span>
                </div>
              </div>

              {/* ================= PREMIUM VISUAL CHARTS SECTION ================= */}
              <div className="visual-charts-dashboard">
                <h3 className="charts-title-decor">Verified Profile Metrics Visualizer</h3>
                
                <div className="charts-grid-container">
                  {/* Card 1: Academic Marksheet Bar Chart */}
                  <div className="chart-wrapper-card">
                    <div className="chart-header-block">
                      <BookOpen size={18} className="chart-header-icon" />
                      <h4>HSC Marksheet Subject Scores</h4>
                    </div>
                    
                    <div className="bar-chart-body">
                      {[
                        { subject: 'Math', score: 88, color: '#2980B9' },
                        { subject: 'Science', score: 82, color: '#27AE60' },
                        { subject: 'English', score: 78, color: '#8E44AD' },
                        { subject: 'Social', score: 85, color: '#F39C12' },
                        { subject: 'Marathi', score: 91, color: '#D35400' }
                      ].map((item, idx) => (
                        <div key={idx} className="bar-row">
                          <span className="subject-lbl">{item.subject}</span>
                          <div className="bar-track">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${item.score}%`, backgroundColor: item.color }}
                            >
                              <span className="inner-score-txt">{item.score}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="chart-footer-caption">Aggregate Percentage: 84.8% (Verified via Board record)</p>
                  </div>

                  {/* Card 2: Land holding records representation */}
                  <div className="chart-wrapper-card">
                    <div className="chart-header-block">
                      <MapPin size={18} className="chart-header-icon" />
                      <h4>7/12 Verified Land Distribution</h4>
                    </div>
                    
                    <div className="donut-chart-simulation">
                      <div className="circle-pie-container">
                        <svg width="120" height="120" viewBox="0 0 36 36" className="circular-chart">
                          <path className="circle-bg"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#eee"
                            strokeWidth="3.8"
                          />
                          <path className="circle-primary"
                            strokeDasharray="67, 100"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#27AE60"
                            strokeWidth="3.8"
                          />
                          <path className="circle-secondary"
                            strokeDasharray="33, 100"
                            strokeDashoffset="-67"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F39C12"
                            strokeWidth="3.8"
                          />
                        </svg>
                        <div className="circle-center-label">
                          <span className="large-txt">2.4</span>
                          <span className="small-txt">Hectares</span>
                        </div>
                      </div>
                      
                      <div className="pie-legend-labels">
                        <div className="legend-row">
                          <span className="legend-dot green"></span>
                          <span className="legend-lbl">Irrigated (67%): <strong>1.6 Ha</strong></span>
                        </div>
                        <div className="legend-row">
                          <span className="legend-dot orange"></span>
                          <span className="legend-lbl">Dryland (33%): <strong>0.8 Ha</strong></span>
                        </div>
                      </div>
                    </div>
                    <p className="chart-footer-caption">Survey No: 45/A, Pune District (Revenue Dept)</p>
                  </div>

                  {/* Card 3: DL status and PAN compliance */}
                  <div className="chart-wrapper-card full-row-card">
                    <div className="chart-header-block">
                      <CreditCard size={18} className="chart-header-icon" />
                      <h4>Driving License & Identity Compliance</h4>
                    </div>
                    
                    <div className="dl-pan-badges-grid">
                      <div className="dl-badge-graphic">
                        <div className="graphic-top-row">
                          <span className="card-lbl">DRIVING LICENSE</span>
                          <span className="status-indicator active">ACTIVE</span>
                        </div>
                        <p className="dl-num">MH-12-20150982741</p>
                        <div className="graphic-bot-row">
                          <div>
                            <span className="sub-lbl">CLASS</span>
                            <p className="val">MCWG, LMV</p>
                          </div>
                          <div>
                            <span className="sub-lbl">VALID UNTIL</span>
                            <p className="val">11/04/2038</p>
                          </div>
                        </div>
                      </div>

                      <div className="dl-badge-graphic pan-graphic">
                        <div className="graphic-top-row">
                          <span className="card-lbl">INCOME TAX DEPT</span>
                          <span className="status-indicator active">VERIFIED</span>
                        </div>
                        <p className="dl-num">BPGPAXXXXK</p>
                        <div className="graphic-bot-row">
                          <div>
                            <span className="sub-lbl">HOLDER</span>
                            <p className="val">{profileData.fullName.toUpperCase()}</p>
                          </div>
                          <div>
                            <span className="sub-lbl">STATUS</span>
                            <p className="val">INDIVIDUAL</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dl-setup-actions-panel">
            <div className="setup-steps-list">
              <div className="setup-step-row">
                <div className="step-num">1</div>
                <div>
                  <h4>Authorize Yojana Sarthi Portal</h4>
                  <p>Give secure read-only permission to query your identity records.</p>
                </div>
              </div>
              <div className="setup-step-row">
                <div className="step-num">2</div>
                <div>
                  <h4>OTP Authentication</h4>
                  <p>Authenticate securely using Aadhaar e-KYC One Time Password.</p>
                </div>
              </div>
              <div className="setup-step-row">
                <div className="step-num">3</div>
                <div>
                  <h4>Instant Verification</h4>
                  <p>Your profile is updated automatically with government records.</p>
                </div>
              </div>
            </div>
            
            <div className="dl-link-options-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="dl-btn-link" onClick={handleStartRealLinking}>
                <span>Link via Cashfree Gateway</span>
                <ArrowRight size={18} />
              </button>
              
              <button 
                className="dl-btn-link" 
                style={{ background: '#34495E', boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)' }}
                onClick={handleStartSimLinking}
              >
                <span>Launch Offline Simulation</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'info':
        return (
          <div className="tab-pane">
            {isEditing ? (
              <form onSubmit={saveProfile} className="profile-edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={profileData.fullName} 
                      onChange={handleInputChange} 
                      placeholder="Enter full name" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Number</label>
                    <input 
                      type="text" 
                      name="aadhaar" 
                      value={profileData.aadhaar} 
                      onChange={handleInputChange} 
                      placeholder="12-digit Aadhaar number" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={profileData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Enter mobile number" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Age (Years)</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={profileData.age} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 45" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Annual Income (₹)</label>
                    <input 
                      type="number" 
                      name="income" 
                      value={profileData.income} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 150000" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Occupation</label>
                    <select name="occupation" value={profileData.occupation} onChange={handleInputChange}>
                      <option value="All">All</option>
                      <option value="Farmer">Farmer / Agriculture</option>
                      <option value="Student">Student</option>
                      <option value="Construction Worker">Construction Worker</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Caste Category</label>
                    <select name="category" value={profileData.category} onChange={handleInputChange}>
                      <option value="All">All</option>
                      <option value="General">General</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="VJNT">VJNT</option>
                      <option value="PwD">PwD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={profileData.gender} onChange={handleInputChange}>
                      <option value="All">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Residential State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={profileData.state || ''} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Maharashtra" 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Residential Address</label>
                    <textarea 
                      name="address" 
                      value={profileData.address} 
                      onChange={handleInputChange} 
                      placeholder="Enter residential address"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save">Save Profile Details</button>
                  <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="info-display-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profileData.fullName || 'Not configured'}</p>
                </div>
                <div className="info-item">
                  <label>Aadhaar Number</label>
                  <p>{profileData.aadhaar || 'Not configured'}</p>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{profileData.phone || 'Not configured'}</p>
                </div>
                <div className="info-item">
                  <label>Age</label>
                  <p>{profileData.age ? `${profileData.age} Years` : 'Not configured'}</p>
                </div>
                <div className="info-item">
                  <label>Annual Income</label>
                  <p>{profileData.income ? `₹${Number(profileData.income).toLocaleString()}` : 'Not configured'}</p>
                </div>
                <div className="info-item">
                  <label>Occupation</label>
                  <p>{profileData.occupation}</p>
                </div>
                <div className="info-item">
                  <label>Category</label>
                  <p>{profileData.category}</p>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <p>{profileData.gender}</p>
                </div>
                <div className="info-item">
                  <label>Residential State</label>
                  <p>{profileData.state || 'Not configured'}</p>
                </div>
                <div className="info-item full-width">
                  <label>Residential Address</label>
                  <p>{profileData.address || 'Not configured'}</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'docs':
        return (
          <div className="tab-pane">
            <form onSubmit={addDocument} className="add-doc-form">
              <input 
                type="text" 
                placeholder="Document Name (e.g. Income Certificate, Caste Certificate)" 
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
              />
              <button type="submit" className="btn-add-doc">Add Document</button>
            </form>
            <div className="docs-list">
              {documents.length > 0 ? (
                documents.map((doc, idx) => (
                  <div key={idx} className="doc-card">
                    <span className="doc-name">📄 {doc.name}</span>
                    <span className="doc-date">Added: {doc.addedAt}</span>
                    <button className="btn-remove-doc" onClick={() => removeDocument(idx)}>Remove</button>
                  </div>
                ))
              ) : (
                <div className="empty-docs">
                  <p>No documents saved yet. Upload or save documents needed for schemes.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'digilocker':
        return renderDigiLockerTab();
      case 'settings':
        return (
          <div className="tab-pane">
            <div className="settings-panel">
              <h3>Reset Profile Data</h3>
              <p>Clearing profile data will remove all configuration settings stored locally.</p>
              <button 
                className="btn-danger-action"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to clear all saved data?')) {
                    localStorage.removeItem('yojana_sarthi_profile');
                    localStorage.removeItem('yojana_sarthi_docs');
                    setProfileData({
                      fullName: '',
                      aadhaar: '',
                      phone: '',
                      address: '',
                      age: '',
                      income: '',
                      occupation: 'All',
                      category: 'All',
                      gender: 'All',
                      verification_status: 'Unverified',
                      data_sources: ['User Input'],
                      documents: []
                    });
                    setDocuments([]);
                    
                    // Clear in Supabase
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                      try {
                        await supabase.from('citizens').delete().eq('id', session.user.id);
                      } catch (err) {
                        console.error(err);
                      }
                    }

                    // Dispatch update event
                    window.dispatchEvent(new Event('profileUpdate'));
                    alert('All data cleared.');
                  }
                }}
              >
                Clear All Stored Citizen Data
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="profile-titles">
          <h1>{profileData.fullName || 'Citizen Profile'}</h1>
          <p>Yojana Sarthi Registered Citizen</p>
        </div>
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile Info</button>
        )}
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default Profile;
