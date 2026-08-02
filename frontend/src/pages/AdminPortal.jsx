import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Users, CheckCircle, AlertTriangle, Search, Check, X, RefreshCw, Eye, FileText, LayoutDashboard } from 'lucide-react';
import './AdminPortal.css';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const AdminPortal = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('summary');
  const [stats, setStats] = useState(null);
  const [citizens, setCitizens] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // track user id being updated

  const fetchStats = async () => {
    try {
      const citizensSnapshot = await getDocs(collection(db, "citizens"));
      const fraudSnapshot = await getDocs(collection(db, "fraud_logs"));

      let total = 0, verified = 0, pending = 0, failed = 0;
      citizensSnapshot.forEach(doc => {
        total++;
        const status = doc.data().verification_status || "Pending";
        if (status === "Verified") verified++;
        else if (status === "Failed") failed++;
        else pending++;
      });

      let unresolvedFraud = 0;
      fraudSnapshot.forEach(doc => {
        if (doc.data().status === "Unresolved") unresolvedFraud++;
      });

      setStats({
        total_users: total,
        verified_users: verified,
        pending_verifications: pending,
        failed_verifications: failed,
        unresolved_fraud_alerts: unresolvedFraud
      });
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  const fetchCitizens = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "citizens"));
      const results = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          name: data.full_name || data.name || 'Citizen',
          age: data.age || '',
          gender: data.gender || '',
          state: data.state || '',
          occupation: data.occupation || '',
          annual_income: data.income || data.annual_income || 0,
          verification_status: data.verification_status || 'Pending',
          category: data.category || '',
          aadhaar: data.aadhaar || ''
        });
      });
      setCitizens(results);
    } catch (e) {
      console.error("Error fetching citizens:", e);
    }
  };

  const fetchFraudAlerts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "fraud_logs"));
      const results = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          user_id: data.user_id || data.citizen_id || '',
          name: data.name || data.citizen_name || 'Citizen',
          alert_type: data.alert_type || 'Discrepancy',
          description: data.description || data.details || '',
          status: data.status || 'Unresolved',
          timestamp: data.timestamp || new Date().toISOString()
        });
      });
      setFraudAlerts(results);
    } catch (e) {
      console.error("Error fetching fraud alerts:", e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchCitizens(), fetchFraudAlerts()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const normalized = tabParam.toLowerCase().replace(' ', '');
      setActiveTab(normalized);
    }
  }, [location.search]);

  const handleUpdateStatus = async (userId, newStatus) => {
    setUpdating(userId);
    try {
      const docRef = doc(db, 'citizens', userId);
      await updateDoc(docRef, { verification_status: newStatus });
      await Promise.all([fetchStats(), fetchCitizens()]);
    } catch (e) {
      alert(`Error updating status: ${e.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleResolveFraud = async (fraudId, newStatus) => {
    try {
      const docRef = doc(db, 'fraud_logs', fraudId);
      await updateDoc(docRef, { status: newStatus });
      await Promise.all([fetchStats(), fetchFraudAlerts()]);
    } catch (e) {
      alert(`Error updating fraud alert: ${e.message}`);
    }
  };

  const filteredCitizens = citizens.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.aadhaar.includes(searchQuery) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVerificationClass = (status) => {
    switch (status) {
      case 'Verified': return 'v-verified';
      case 'Failed': return 'v-failed';
      default: return 'v-pending';
    }
  };

  const renderSummaryTab = () => {
    if (!stats) return null;
    return (
      <div className="admin-summary-view">
        <div className="summary-cards-grid">
          <div className="sum-card">
            <Users className="icon-users" size={24} />
            <div className="sum-details">
              <h4>Total Registered</h4>
              <p>{stats.total_users}</p>
            </div>
          </div>
          <div className="sum-card">
            <CheckCircle className="icon-check" size={24} />
            <div className="sum-details">
              <h4>Verified Citizens</h4>
              <p>{stats.verified_users}</p>
            </div>
          </div>
          <div className="sum-card">
            <AlertTriangle className="icon-alert" size={24} />
            <div className="sum-details">
              <h4>Unresolved Alerts</h4>
              <p>{stats.unresolved_fraud_alerts}</p>
            </div>
          </div>
        </div>

        <div className="summary-recent-section">
          <h3>Operations Overview</h3>
          <div className="ops-overview-card">
            <p><strong>System Status:</strong> Active & Healthy</p>
            <p><strong>Firebase Node Connection:</strong> Active</p>
            <p><strong>Verification Accuracy:</strong> 99.4%</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="admin-loading-row">
          <RefreshCw size={24} className="spin-icon" />
          <span>Synchronizing Firestore Node Data...</span>
        </div>
      );
    }

    switch(activeTab) {
      case 'summary':
        return renderSummaryTab();
        
      case 'citizens':
        return (
          <div className="admin-tab-table-wrapper">
            <div className="table-controls-row">
              <div className="search-bar">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, Aadhaar, ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="sync-btn-ref" onClick={loadAllData}>
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>

            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>Citizen ID</th>
                  <th>Name</th>
                  <th>Aadhaar</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCitizens.length > 0 ? (
                  filteredCitizens.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono">{c.id}</td>
                      <td>
                        <div className="cit-name-block">
                          <strong>{c.name}</strong>
                          <span className="cit-sub">{c.occupation} · Age {c.age}</span>
                        </div>
                      </td>
                      <td className="font-mono">{c.aadhaar}</td>
                      <td>{c.category}</td>
                      <td>
                        <span className={`status-v-pill ${getVerificationClass(c.verification_status)}`}>
                          {c.verification_status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button 
                            className="act-btn approve"
                            onClick={() => handleUpdateStatus(c.id, 'Verified')}
                            disabled={updating === c.id}
                            title="Approve Citizen"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            className="act-btn reject"
                            onClick={() => handleUpdateStatus(c.id, 'Failed')}
                            disabled={updating === c.id}
                            title="Flag/Reject Citizen"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data-td">No matching citizen records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'fraudalerts':
      case 'fraud':
        return (
          <div className="admin-fraud-alerts-view">
            <div className="table-controls-row">
              <h3>Mitigation Log</h3>
              <button className="sync-btn-ref" onClick={loadAllData}>
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>

            <div className="fraud-alerts-list">
              {fraudAlerts.length > 0 ? (
                fraudAlerts.map(alert => (
                  <div key={alert.id} className={`fraud-alert-item ${alert.status.toLowerCase()}`}>
                    <div className="fraud-alert-header">
                      <div className="alert-meta">
                        <AlertTriangle className="icon-warning" size={18} />
                        <h4>{alert.alert_type}</h4>
                        <span className="user-id">User: {alert.name} ({alert.user_id})</span>
                      </div>
                      <span className={`fraud-status-badge ${alert.status.toLowerCase()}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="fraud-desc">{alert.description}</p>
                    <div className="fraud-footer">
                      <span className="timestamp">Logged: {new Date(alert.timestamp).toLocaleString()}</span>
                      {alert.status === 'Unresolved' ? (
                        <button 
                          className="resolve-fraud-btn"
                          onClick={() => handleResolveFraud(alert.id, 'Resolved')}
                        >
                          Resolve & Clear Flag
                        </button>
                      ) : (
                        <button 
                          className="unresolve-fraud-btn"
                          onClick={() => handleResolveFraud(alert.id, 'Unresolved')}
                        >
                          Mark Unresolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-fraud-state">
                  <CheckCircle size={48} className="success-icon" />
                  <h4>All Clear</h4>
                  <p>No security warnings or income discrepancies flagged in the system logs.</p>
                </div>
              )}
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
        <div className="sidebar-brand">
          <Shield size={20} className="shield-icon" />
          <span>Sarthi Console</span>
        </div>
        <div className="sidebar-nav-btns">
          <button 
            className={activeTab === 'summary' ? 'active' : ''}
            onClick={() => setActiveTab('summary')}
          >
            <LayoutDashboard size={16} /> Summary
          </button>
          <button 
            className={activeTab === 'citizens' ? 'active' : ''}
            onClick={() => setActiveTab('citizens')}
          >
            <Users size={16} /> Citizens
          </button>
          <button 
            className={(activeTab === 'fraudalerts' || activeTab === 'fraud') ? 'active' : ''}
            onClick={() => setActiveTab('fraudalerts')}
          >
            <AlertTriangle size={16} /> Fraud Alerts
          </button>
        </div>
      </div>

      <div className="admin-content-area">
        <div className="admin-main-header">
          <h1>Operations Center</h1>
          <p>Real-time Firestore audits, verification workflows, and fraud logging controls.</p>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPortal;
