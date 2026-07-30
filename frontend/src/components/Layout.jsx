import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, Globe, User, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import emblem from '../assets/images/emblem.png';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState('English');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('yojana_sarthi_current_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Failed to parse user session:', err);
      }
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const displayName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Citizen');

  return (
    <div className="layout">
      {/* Official Government Tricolor Strip */}
      <div className="official-tricolor-strip">
        <div className="strip-saffron"></div>
        <div className="strip-white"></div>
        <div className="strip-green"></div>
      </div>

      {/* Top Main Government Header */}
      <header className="top-header">
        <div className="header-left-brand">
          <button className="menu-toggle-btn" onClick={toggleSidebar} title="Toggle Navigation Menu">
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="menu-lbl">Menu</span>
          </button>
          
          <div className="brand-emblem-box">
            <img src={emblem} alt="Government Emblem" className="gov-emblem" />
          </div>

          <div className="gov-title-block">
            <span className="gov-subtitle">महाराष्ट्र शासन • Government of Maharashtra</span>
            <h1 className="portal-name">Yojana Sarthi — Scheme Portal</h1>
          </div>
        </div>

        <div className="header-right-actions">
          <div className="gov-notice-badge">
            <Shield size={14} />
            <span>Official DBT Service</span>
          </div>

          <button 
            className="lang-select-btn"
            onClick={() => setLang(l => l === 'English' ? 'मराठी' : 'English')}
          >
            <Globe size={15} />
            <span>{lang}</span>
          </button>

          <div className="user-profile-badge">
            <User size={16} />
            <span>{displayName}</span>
          </div>
        </div>
      </header>

      {/* Slide-over / Toggleable Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Backdrop overlay when sidebar is opened */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar}></div>
      )}

      {/* Main Page Container (Occupies 100% width while surfing) */}
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="gov-footer">
        <div className="footer-content">
          <p>© 2026 Government of Maharashtra • Yojana Sarthi Direct Benefit Portal</p>
          <p className="footer-sub">Designed & Maintained for Transparent Public Service Delivery</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
