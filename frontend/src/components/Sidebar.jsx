import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
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
  X,
  LogOut
} from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './Sidebar.css';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        localStorage.removeItem('yojana_sarthi_current_user');
        localStorage.removeItem('yojana_sarthi_profile');
        localStorage.removeItem('yojana_sarthi_docs');
        window.dispatchEvent(new Event('profileUpdate'));
        onClose();
        navigate('/login');
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
  };

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

  const isAdmin = currentUser?.role === 'admin';

  const citizenMenuItems = [
    { name: t('nav.home', 'Portal Home & Finder'), icon: <Home size={18} />, path: '/landing' },
    { name: t('nav.wizard', 'Scheme Application Wizard'), icon: <UserPlus size={18} />, path: '/onboarding' },
    { name: t('nav.dashboard', 'Citizen Dashboard'), icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: t('nav.docs', 'Document Compliance'), icon: <FileText size={18} />, path: '/docs' },
    { name: t('nav.matrix', 'Scheme Matrix'), icon: <BarChart2 size={18} />, path: '/comparison' },
    { name: t('nav.predictor', 'Rejection Risk Check'), icon: <AlertTriangle size={18} />, path: '/predictor' },
    { name: t('nav.planner', 'Lifecycle Planner'), icon: <Calendar size={18} />, path: '/planner' },
    { name: t('nav.profile', 'Citizen Profile'), icon: <User size={18} />, path: '/profile' },
  ];

  const adminMenuItems = [
    { name: t('nav.admin', 'Admin Operations Center'), icon: <ShieldCheck size={18} />, path: '/admin' },
    { name: t('nav.matrix', 'Scheme Matrix'), icon: <BarChart2 size={18} />, path: '/comparison' },
    { name: t('nav.profile', 'Admin Profile'), icon: <User size={18} />, path: '/profile' },
  ];

  const menuItems = isAdmin ? adminMenuItems : citizenMenuItems;
  const defaultHomePath = isAdmin ? '/admin' : '/landing';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <Link to={defaultHomePath} onClick={onClose} className="sidebar-brand-link">
          <div className="logo-container">
            <img src={emblem} alt="Government Emblem" className="sidebar-emblem" />
          </div>
          <div className="brand-titles">
            <h2>Yojana Sarthi</h2>
            <span className="brand-subtitle">{isAdmin ? t('nav.admin_sub', 'Administrator Portal') : t('nav.citizen_sub', 'Government Scheme Navigation')}</span>
          </div>
        </Link>
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
        <Link to="/profile" onClick={onClose} className="user-mini-profile-link">
          <div className="user-mini-profile">
            <div className="avatar">{initials}</div>
            <div className="info">
              <p className="name">{fullName}</p>
              <span className={`status-pill ${isAdmin ? 'verified' : (profile?.verification_status === 'Verified' ? 'verified' : 'unverified')}`}>
                {isAdmin ? 'System Administrator' : (profile?.verification_status === 'Verified' ? 'Verified Beneficiary' : 'Unverified Beneficiary')}
              </span>
            </div>
          </div>
        </Link>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Log Out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
