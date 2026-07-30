import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  UserPlus, 
  MessageSquare, 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  AlertTriangle, 
  Calendar, 
  Mic, 
  User, 
  ShieldCheck, 
  Languages,
  X
} from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Read current user session
    const userStr = localStorage.getItem('yojana_sarthi_current_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Failed to parse user session in sidebar:', err);
      }
    }

    // Read current user profile
    const profileStr = localStorage.getItem('yojana_sarthi_profile');
    if (profileStr) {
      try {
        setProfile(JSON.parse(profileStr));
      } catch (err) {
        console.error('Failed to parse profile in sidebar:', err);
      }
    }

    // Trigger update on storage changes
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('yojana_sarthi_current_user');
      if (updatedUser) {
        try {
          setCurrentUser(JSON.parse(updatedUser));
        } catch (e) {}
      }
      const updatedProfile = localStorage.getItem('yojana_sarthi_profile');
      if (updatedProfile) {
        try {
          setProfile(JSON.parse(updatedProfile));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event listener for instant updates in single-page routing context
    window.addEventListener('profileUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdate', handleStorageChange);
    };
  }, [isOpen]);

  const fullName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Citizen');
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(namePart => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';

  const menuItems = [
    { name: 'Portal Home & Finder', icon: <Home size={18} />, path: '/landing' },
    { name: 'Scheme Application Wizard', icon: <UserPlus size={18} />, path: '/onboarding' },
    { name: 'Citizen Assistant', icon: <MessageSquare size={18} />, path: '/ai-assistant' },
    { name: 'Citizen Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Document Compliance', icon: <FileText size={18} />, path: '/docs' },
    { name: 'Scheme Matrix', icon: <BarChart2 size={18} />, path: '/comparison' },
    { name: 'Rejection Risk Check', icon: <AlertTriangle size={18} />, path: '/predictor' },
    { name: 'Lifecycle Planner', icon: <Calendar size={18} />, path: '/planner' },
    { name: 'Voice Portal', icon: <Mic size={18} />, path: '/voice' },
    { name: 'Citizen Profile', icon: <User size={18} />, path: '/profile' },
    { name: 'Administrative Portal', icon: <ShieldCheck size={18} />, path: '/admin' },
    { name: 'Regional Languages', icon: <Languages size={18} />, path: '/multilingual' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={emblem} alt="Government Emblem" className="sidebar-emblem" />
        </div>
        <div className="brand-titles">
          <h2>Yojana Sarthi</h2>
          <span className="brand-subtitle">Government Scheme Navigation</span>
        </div>
        <button className="close-sidebar-btn" onClick={onClose} title="Close Navigation">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-profile">
          <div className="avatar">{initials}</div>
          <div className="info">
            <p className="name">{fullName}</p>
            <span className={`status-pill ${profile?.verification_status === 'Verified' ? 'verified' : 'unverified'}`}>
              {profile?.verification_status === 'Verified' ? 'Verified Beneficiary' : 'Unverified Beneficiary'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
