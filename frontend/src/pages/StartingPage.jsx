import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Wheat, 
  GraduationCap, 
  HeartPulse, 
  Baby, 
  Briefcase, 
  Accessibility, 
  Search, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './StartingPage.css';

const StartingPage = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Agriculture & Farmers', icon: <Wheat size={24} />, desc: 'Crop insurance, equipment subsidies, fertilizer support, and financial aid.' },
    { name: 'Education & Scholarships', icon: <GraduationCap size={24} />, desc: 'Pre-matric and post-matric student scholarships, hostel aid, and fee waivers.' },
    { name: 'Health & Wellness', icon: <HeartPulse size={24} />, desc: 'Free medical treatment, health insurance schemes, and maternity benefits.' },
    { name: 'Women & Child Development', icon: <Baby size={24} />, desc: 'Self-help group support, marriage assistance, and nutrition programs.' },
    { name: 'Employment & Skills', icon: <Briefcase size={24} />, desc: 'Vocational skill training, entrepreneurship loans, and employment guarantees.' },
    { name: 'Social Welfare & Pension', icon: <Accessibility size={24} />, desc: 'Old age pension, disability benefits, and minority community empowerment.' }
  ];

  return (
    <div className="starting-page-container">
      {/* 1. Top Accessibility & Language Bar */}
      <div className="gov-top-bar">
        <div className="top-bar-inner">
          <div className="gov-left-text">
            <span>भारत सरकार | Government of India</span>
            <span className="separator">|</span>
            <span>महाराष्ट्र शासन | Government of Maharashtra</span>
          </div>
          <div className="gov-right-links">
            <a href="#content">Skip to main content</a>
            <span className="separator">|</span>
            <a href="#accessibility">Screen Reader Access</a>
            <span className="separator">|</span>
            <div className="font-controls">
              <button title="Decrease text size">A-</button>
              <button title="Default text size">A</button>
              <button title="Increase text size">A+</button>
            </div>
            <span className="separator">|</span>
            <div className="language-selector">
              <Globe size={13} />
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Branding Header */}
      <header className="gov-main-header">
        <div className="header-inner">
          <div className="header-left">
            <div className="emblem-box">
              <img src={emblem} alt="National Emblem of India" className="header-emblem" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title">योजना सारथी</div>
              <div className="brand-english">Yojana Sarthi</div>
              <div className="brand-tagline">Unified Welfare Scheme Matching Engine</div>
            </div>
          </div>
          <div className="header-right">
            <div className="badge-digital-india">
              <span className="digital-text">Digital</span>
              <span className="india-text">India</span>
            </div>
            <div className="badge-mygov">
              <span className="mygov-text">my</span>
              <span className="gov-text">Gov</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Search & Action Area */}
      <section className="gov-hero-section" id="content">
        <div className="hero-inner">
          <div className="hero-badge">
            <Shield size={14} />
            <span>Official DBT & DigiLocker Integrated Platform</span>
          </div>
          <h1 className="hero-headline">
            Discover Government Schemes <br />
            <span>Tailored for Your Profile</span>
          </h1>
          <p className="hero-desc">
            Instantly match your profile (Farmers, Students, Women, Workers) against 500+ state and central welfare schemes. Calculate precise eligibility rules and track benefits.
          </p>

          {/* Search Bar Mockup */}
          <div className="search-mockup-container">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-svg" />
              <input type="text" placeholder="Enter keywords e.g. Farmer, Scholarship, Free treatment..." readOnly onClick={() => navigate('/login')} />
            </div>
            <button className="search-btn-cta" onClick={() => navigate('/login')}>
              <span>Launch Scheme Finder</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="hero-features-checklist">
            <div className="check-item">
              <CheckCircle2 size={16} />
              <span>Zero-Registration Discovery</span>
            </div>
            <div className="check-item">
              <CheckCircle2 size={16} />
              <span>Verified Rule Engine</span>
            </div>
            <div className="check-item">
              <CheckCircle2 size={16} />
              <span>Direct Transfer (DBT) Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Strip */}
      <section className="gov-stats-strip">
        <div className="stats-inner">
          <div className="stat-card">
            <span className="stat-num">500+</span>
            <span className="stat-lbl">Central & State Schemes</span>
          </div>
          <div className="stats-divider"></div>
          <div className="stat-card">
            <span className="stat-num">29</span>
            <span className="stat-lbl">States & UTs Covered</span>
          </div>
          <div className="stats-divider"></div>
          <div className="stat-card">
            <span className="stat-num">₹24,000Cr+</span>
            <span className="stat-lbl">Direct Benefits Disbursed</span>
          </div>
        </div>
      </section>

      {/* 5. Scheme Categories Grid */}
      <section className="gov-categories-section">
        <div className="categories-inner">
          <div className="section-header-centered">
            <h2>Browse Schemes by Sector</h2>
            <p>Select a category to explore available benefits and verification rules</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div key={i} className="category-card-item" onClick={() => navigate('/login')}>
                <div className="category-icon-box">
                  {cat.icon}
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <div className="card-link-action">
                  <span>Explore Schemes</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Easy 3-Step Process */}
      <section className="gov-steps-section">
        <div className="steps-inner">
          <div className="section-header-centered">
            <h2>How Yojana Sarthi Works</h2>
            <p>Three simple steps to secure your eligible benefits</p>
          </div>
          <div className="steps-flow">
            <div className="step-card-box">
              <div className="step-num-badge">1</div>
              <h3>Enter Profile Details</h3>
              <p>Provide basic details like age, income, caste, and occupation.</p>
            </div>
            <div className="step-arrow-flow">➔</div>
            <div className="step-card-box">
              <div className="step-num-badge">2</div>
              <h3>Get Instant Matching</h3>
              <p>Our rule engine scans 500+ schemes to find eligible ones.</p>
            </div>
            <div className="step-arrow-flow">➔</div>
            <div className="step-card-box">
              <div className="step-num-badge">3</div>
              <h3>Apply & Track DBT</h3>
              <p>Follow guidelines, upload documents, and track benefits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NIC Style Official Footer */}
      <footer className="gov-footer-nic">
        <div className="footer-inner">
          <div className="footer-top-columns">
            <div className="footer-col brand-col">
              <h3>Yojana Sarthi Portal</h3>
              <p>National unified scheme matching platform facilitating citizens in easy eligibility discovery, documentation compliance, and benefit tracking.</p>
            </div>
            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#content">Home</a></li>
                <li><a href="#accessibility">Accessibility Statement</a></li>
                <li><a onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>Citizen Login</a></li>
                <li><a onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>Administrator Portal</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Help & Support</h3>
              <ul>
                <li><a href="#faq">Frequently Asked Questions (FAQ)</a></li>
                <li><a href="#contact">Contact Support Helpdesk</a></li>
                <li><a href="#sitemap">Sitemap</a></li>
              </ul>
            </div>
          </div>

          <hr className="footer-divider-line" />

          <div className="footer-bottom-bar">
            <div className="footer-compliance-text">
              <span>© {new Date().getFullYear()} Yojana Sarthi. All Rights Reserved.</span>
              <span className="dot">•</span>
              <a href="#privacy">Privacy Policy</a>
              <span className="dot">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="dot">•</span>
              <a href="#hyperlink">Hyperlinking Policy</a>
            </div>
            <div className="footer-tech-credit">
              <span>Designed, Developed, and Hosted by Yojana Sarthi Digital Cell</span>
              <span className="separator">|</span>
              <span>Supported by National Informatics Centre (NIC) <ExternalLink size={11} className="inline-svg" /></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StartingPage;
