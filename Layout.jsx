import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <input type="text" placeholder="Search for schemes, documents, or services..." />
          </div>
          <div className="header-actions">
            <button className="lang-toggle">English</button>
            <div className="notifications">
              <span className="badge">3</span>
              🔔
            </div>
          </div>
        </header>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
