import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Bell, Globe, User, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import ChatWidget from './ChatWidget';
import emblem from '../assets/images/emblem.png';
import './Layout.css';

const LANGS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
  { code: 'mr', label: 'मराठी', native: 'Marathi' },
];

const Layout = ({ children }) => {
  const { i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [langIndex, setLangIndex] = useState(() => {
    const saved = localStorage.getItem('ys_lang_index');
    if (saved) return parseInt(saved);
    // fallback or default to current i18n language
    const idx = LANGS.findIndex(l => l.code === i18n.language);
    return idx !== -1 ? idx : 2; // Default to Marathi (idx 2)
  });
  const [currentUser, setCurrentUser] = useState(null);
  const lang = LANGS[langIndex];

  useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('yojana_sarthi_current_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (err) {
          console.error('Failed to parse user session:', err);
        }
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdate', handleStorageChange);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const isAdmin = currentUser?.role === 'admin';
  const displayName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : (isAdmin ? 'Administrator' : 'Citizen'));
  const homePath = isAdmin ? '/admin' : '/landing';

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
          
          <Link to={homePath} className="header-brand-link">
            <div className="brand-emblem-box">
              <img src={emblem} alt="Government Emblem" className="gov-emblem" />
            </div>
            <div className="gov-title-block">
              <span className="gov-subtitle">महाराष्ट्र शासन • Government of Maharashtra</span>
              <h1 className="portal-name">Yojana Sarthi — {isAdmin ? 'Admin Operations Center' : 'Scheme Portal'}</h1>
            </div>
          </Link>
        </div>

        <div className="header-right-actions">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="gov-notice-badge-link" title={isAdmin ? "Admin Operations" : "View Schemes Dashboard"}>
            <div className="gov-notice-badge">
              <Shield size={14} />
              <span>{isAdmin ? 'Admin Operations' : 'Official DBT Service'}</span>
            </div>
          </Link>

          <button 
            className="lang-select-btn"
            onClick={() => {
              const next = (langIndex + 1) % LANGS.length;
              const nextLang = LANGS[next];
              setLangIndex(next);
              localStorage.setItem('ys_lang_index', String(next));
              localStorage.setItem('yojana_sarthi_lang', nextLang.code);
              i18n.changeLanguage(nextLang.code);
              window.dispatchEvent(new CustomEvent('languageChanged', { detail: nextLang.code }));
            }}
            title={`Switch language (current: ${lang.native})`}
          >
            <Globe size={15} />
            <span>{lang.label}</span>
          </button>

          <Link to="/profile" className="user-profile-badge-link" title="View Profile Vault">
            <div className="user-profile-badge">
              <User size={16} />
              <span>{displayName}</span>
            </div>
          </Link>
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

      {/* Floating AI Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Layout;
