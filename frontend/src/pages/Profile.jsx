import React, { useState, useEffect } from 'react';
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
    gender: 'All'
  });
  
  const [documents, setDocuments] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load profile data and documents from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('yojana_sarthi_profile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    const savedDocs = localStorage.getItem('yojana_sarthi_docs');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
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
    localStorage.setItem('yojana_sarthi_profile', JSON.stringify(profileData));
    setIsEditing(false);
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

  const tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'docs', label: 'Documents Vault' },
    { id: 'settings', label: 'Account Settings' }
  ];

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
                      <option value="farmer">Farmer / Agriculture</option>
                      <option value="student">Student</option>
                      <option value="construction worker">Construction Worker</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="entrepreneur">Entrepreneur</option>
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
                      gender: 'All'
                    });
                    setDocuments([]);
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
