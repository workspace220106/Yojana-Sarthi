import React from 'react';
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
  Languages 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Landing', icon: <Home size={20} />, path: '/landing' },
    { name: 'Onboarding', icon: <UserPlus size={20} />, path: '/onboarding' },
    { name: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/ai-assistant' },
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Document Advisor', icon: <FileText size={20} />, path: '/docs' },
    { name: 'Scheme Comparison', icon: <BarChart2 size={20} />, path: '/comparison' },
    { name: 'Rejection Predictor', icon: <AlertTriangle size={20} />, path: '/predictor' },
    { name: 'Benefit Planner', icon: <Calendar size={20} />, path: '/planner' },
    { name: 'Voice Interface', icon: <Mic size={20} />, path: '/voice' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Admin Portal', icon: <ShieldCheck size={20} />, path: '/admin' },
    { name: 'Multilingual', icon: <Languages size={20} />, path: '/multilingual' },
  ];

  return (
    <aside className="sidebar">
      <div className="tricolor-bar">
        <div className="saffron"></div>
        <div className="white"></div>
        <div className="green"></div>
      </div>
      
      <div className="sidebar-header">
        <div className="logo-placeholder">B</div>
        <h1>BharatGov</h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-profile">
          <div className="avatar">RA</div>
          <div className="info">
            <p className="name">Rajendra A.</p>
            <p className="status">Verified Citizen</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
