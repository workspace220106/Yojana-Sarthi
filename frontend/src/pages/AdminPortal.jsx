import React, { useState } from 'react';
import './AdminPortal.css';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('citizens');

  const alerts = [
    { type: 'Fraud', user: 'User-9128', msg: 'Multiple income certificates detected.', level: 'Critical' },
    { type: 'System', user: 'DB-Node', msg: 'Sync delay in DigiLocker service.', level: 'Medium' }
  ];

  const renderTab = () => {
    switch(activeTab) {
      case 'citizens':
        return (
          <div className="admin-tab">
            <div className="search-controls">
              <input type="text" placeholder="Search by name, Aadhaar, or ID..." />
              <button className="btn-search">Filter</button>
            </div>
            <table className="citizen-table">
              <thead>
                <tr>
                  <th>Citizen ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map(i => (
                  <tr key={i}>
                    <td>BG-{9182 + i}</td>
                    <td>Citizen Name {i}</td>
                    <td><span className="dot active"></span> Active</td>
                    <td>2 hours ago</td>
                    <td><button className="btn-view">Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'fraud':
        return (
          <div className="admin-tab">
            <div className="alerts-list">
              {alerts.map((alert, i) => (
                <div key={i} className={`alert-card ${alert.level.toLowerCase()}`}>
                  <div className="alert-badge">{alert.level}</div>
                  <div className="alert-meta">
                    <strong>{alert.type} Alert</strong>
                    <span>User: {alert.user}</span>
                  </div>
                  <p>{alert.msg}</p>
                  <button className="btn-audit">Audit</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="admin-tab"><p>{activeTab} view coming soon.</p></div>;
    }
  };

  return (
    <div className="admin-portal-page">
      <div className="admin-sidebar-alt">
        {['Summary', 'Citizens', 'Fraud Alerts', 'Scheme Config', 'Logs'].map(tab => (
          <button 
            key={tab} 
            className={activeTab === tab.toLowerCase() ? 'active' : ''}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-content-area">
        <h1>Admin Operations Center</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <label>Total Citizens</label>
            <span>12.4M</span>
          </div>
          <div className="stat-card">
            <label>Pending Approvals</label>
            <span>89.2K</span>
          </div>
          <div className="stat-card">
            <label>Fraud Mitigation</label>
            <span className="success">+14%</span>
          </div>
        </div>
        {renderTab()}
      </div>
    </div>
  );
};

export default AdminPortal;
