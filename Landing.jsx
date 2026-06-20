import React from 'react';
import './Landing.css';
import dashboardMockup from '../assets/images/dashboard_mockup.png';
import citizenServices from '../assets/images/citizen_services.png';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Direct Benefit Transfer • 2026</span>
          <h1>Empowering every citizen through <span>Digital Governance.</span></h1>
          <p>Access 500+ government schemes, track your benefits, and resolve issues in minutes with Yojana Sarthi's AI-powered platform.</p>
          <div className="hero-actions">
            <button className="btn-primary">Apply for Schemes</button>
            <button className="btn-secondary">Check Eligibility</button>
          </div>
        </div>
        <div className="hero-visual">
          <img src={dashboardMockup} alt="Yojana Sarthi Dashboard Mockup" className="hero-image" />
          <div className="stats-card">
            <div className="stat">
              <span className="value">₹24,000Cr</span>
              <span className="label">Disbursed</span>
            </div>
            <div className="stat">
              <span className="value">98.5%</span>
              <span className="label">Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Strip */}
      <section className="ai-demo-strip">
        <div className="ai-brand">
          <span className="ai-icon">✨</span>
          <p>Ask <strong>Bharat AI</strong>: "Show me education schemes for girl child in Karnataka"</p>
        </div>
        <button className="btn-text">Try Bharat AI →</button>
      </section>

      {/* App Details and Main Features Section */}
      <section className="app-details-section">
        <div className="details-grid">
          <div className="details-visual">
            <img src={citizenServices} alt="Citizen Services Portal" className="details-image" />
          </div>
          <div className="details-content">
            <span className="section-label">HOW IT WORKS</span>
            <h2>Unified Access to Benefits & Smart Guidance</h2>
            <p className="section-desc">
              Yojana Sarthi simplifies the search for government schemes by matching your unique profile and providing real-time AI assistance.
            </p>

            <ul className="details-list">
              <li>
                <div className="detail-icon">💬</div>
                <div className="detail-text">
                  <h4>AI Assistant Chat</h4>
                  <p>Describe your needs in conversational language and instantly find eligible schemes.</p>
                </div>
              </li>
              <li>
                <div className="detail-icon">📊</div>
                <div className="detail-text">
                  <h4>Scheme Comparison Matrix</h4>
                  <p>Compare benefits, eligibility criteria, and documents required side-by-side.</p>
                </div>
              </li>
              <li>
                <div className="detail-icon">⚠️</div>
                <div className="detail-text">
                  <h4>Smart Rejection Predictor</h4>
                  <p>Identify document discrepancies and prediction scores before you apply.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Card Features Grid */}
      <section className="features-grid-header">
        <h2>Explore Core Capabilities</h2>
        <p>A suite of features designed to bridge the gap between citizen and governance.</p>
      </section>
      <section className="features-grid">
        <div className="feature-card">
          <div className="icon">🛡️</div>
          <h3>Secure & Verified</h3>
          <p>Direct Aadhaar and DigiLocker integration ensures your data is always safe.</p>
        </div>
        <div className="feature-card">
          <div className="icon">⚡</div>
          <h3>Instant Eligibility</h3>
          <p>Our smart engine matches your profile with 1000+ state and central schemes.</p>
        </div>
        <div className="feature-card">
          <div className="icon">🗣️</div>
          <h3>Voice Assistant</h3>
          <p>Search and inquire in regional languages using intuitive voice commands.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
