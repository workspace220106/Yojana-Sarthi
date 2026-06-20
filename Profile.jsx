import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'docs', label: 'Documents' },
    { id: 'history', label: 'History' },
    { id: 'saved', label: 'Saved Schemes' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'info':
        return (
          <div className="tab-pane">
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>Rajendra Anande</p>
              </div>
              <div className="info-item">
                <label>Aadhaar Number</label>
                <p>XXXX-XXXX-1234 (Verified ✅)</p>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <p>+91 98765 43210</p>
              </div>
              <div className="info-item">
                <label>Address</label>
                <p>Sector 5, Bengaluru, Karnataka - 560001</p>
              </div>
            </div>
          </div>
        );
      case 'docs':
        return (
          <div className="tab-pane">
            <div className="docs-list">
              {['Aadhaar Card', 'PAN Card', 'Income Certificate', 'Ration Card'].map(doc => (
                <div key={doc} className="doc-card">
                  <span>📄 {doc}</span>
                  <button className="btn-view">View</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="tab-pane"><p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon.</p></div>;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">RA</div>
        <div className="profile-titles">
          <h1>Rajendra Anande</h1>
          <p>Karnataka Citizen • ID: BG-99281</p>
        </div>
        <button className="btn-edit">Edit Profile</button>
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
