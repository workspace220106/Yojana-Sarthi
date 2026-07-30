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
  ExternalLink
} from 'lucide-react';
import './Profile.css';

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
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkingError, setLinkingError] = useState('');

  // Load profile data and documents from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('yojana_sarthi_profile');
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch (e) {
        console.error(e);
      }
    }
    const savedDocs = localStorage.getItem('yojana_sarthi_docs');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profileData,
      verification_status: profileData.verification_status || 'Unverified',
      data_sources: profileData.data_sources || ['User Input']
    };
    setProfileData(updated);
    localStorage.setItem('yojana_sarthi_profile', JSON.stringify(updated));
    setIsEditing(false);
    
    // Dispatch update event
    window.dispatchEvent(new Event('profileUpdate'));
    alert('Profile saved successfully!');
  };

  const addDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const updatedDocs = [...documents, { name: newDocName.trim(), addedAt: new Date().toLocaleDateString() }];
    setDocuments(updatedDocs);
    localStorage.setItem('yojana_sarthi_docs', JSON.stringify(updatedDocs));
    setNewDocName('');
  };

  const removeDocument = (index) => {
    const updatedDocs = documents.filter((_, idx) => idx !== index);
    setDocuments(updatedDocs);
    localStorage.setItem('yojana_sarthi_docs', JSON.stringify(updatedDocs));
  };

  // Simulated DigiLocker Handlers
  const handleStartLinking = () => {
    setIsLinking(true);
    setLinkingError('');
    setShowOtpStep(false);
    setAadhaarInput('');
    setPinInput('');
  };

  const handleDigiLockerSignIn = (e) => {
    e.preventDefault();
    if (!aadhaarInput.trim() || aadhaarInput.length < 10) {
      setLinkingError('Please enter a valid Aadhaar or Mobile Number (at least 10 digits).');
      return;
    }
    if (pinInput.length !== 6 || !/^\d+$/.test(pinInput)) {
      setLinkingError('Security PIN must be a 6-digit numeric PIN.');
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
    setTimeout(() => {
      // Create user details based on active logged in user
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

      // 1. Update Profile
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
        data_sources: ['User Input', 'DigiLocker']
      };
      setProfileData(verifiedProfile);
      localStorage.setItem('yojana_sarthi_profile', JSON.stringify(verifiedProfile));

      // 2. Add Official DigiLocker Documents to Vault
      const freshDocs = [
        { name: 'Aadhaar Card (Verified via DigiLocker)', addedAt: new Date().toLocaleDateString() },
        { name: 'Caste Certificate - OBC (Verified via DigiLocker)', addedAt: new Date().toLocaleDateString() },
        { name: 'Income Certificate - Revenue Dept (Verified via DigiLocker)', addedAt: new Date().toLocaleDateString() }
      ];
      setDocuments(freshDocs);
      localStorage.setItem('yojana_sarthi_docs', JSON.stringify(freshDocs));

      // 3. Clear Linking State
      setSyncing(false);
      setIsLinking(false);
      
      // Dispatch events for layout and sidebar updates
      window.dispatchEvent(new Event('profileUpdate'));
      alert('DigiLocker linked successfully! Verified profile attributes updated.');
    }, 1500);
  };

  const handleUnlinkDigiLocker = () => {
    if (window.confirm('Are you sure you want to unlink DigiLocker? Verified status will be reset.')) {
      const unlinkedProfile = {
        ...profileData,
        aadhaar: '',
        verification_status: 'Unverified',
        data_sources: ['User Input']
      };
      setProfileData(unlinkedProfile);
      localStorage.setItem('yojana_sarthi_profile', JSON.stringify(unlinkedProfile));

      // Remove verified docs
      const userDocs = documents.filter(doc => !doc.name.includes('DigiLocker'));
      setDocuments(userDocs);
      localStorage.setItem('yojana_sarthi_docs', JSON.stringify(userDocs));

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

    if (isLinking) {
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
                    <button type="button" className="dl-btn-cancel" onClick={() => setIsLinking(false)}>Cancel</button>
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

    return (
      <div className="digilocker-tab-wrapper">
        <div className="digilocker-hero-info">
          <div className="hero-left-dl">
            <div className="official-dl-tag">
              <ShieldCheck size={18} />
              <span>Ministry of Electronics & IT (MeitY)</span>
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
              <div className="dl-docs-flex">
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>Aadhaar Card</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>Income Certificate</span>
                </div>
                <div className="dl-doc-badge">
                  <FileText size={16} />
                  <span>Caste Certificate</span>
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
            
            <button className="dl-btn-link" onClick={handleStartLinking}>
              <span>Link DigiLocker Account</span>
              <ArrowRight size={18} />
            </button>
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
                onClick={() => {
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
                      data_sources: ['User Input']
                    });
                    setDocuments([]);
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
