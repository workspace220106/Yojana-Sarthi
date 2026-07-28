import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './StartingPage.css';

const StartingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="starting-page">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="grid-pattern"></div>

      <div className="content">
        <div className="emblem-container fade-in">
          <img src={emblem} alt="Government Emblem" className="emblem" />
        </div>

        <div className="badge-pill slide-up">
          <Shield size={15} />
          <span>Government of India & Maharashtra Scheme Portal</span>
        </div>

        <h1 className="title slide-up delay-1">
          Yojana Sarthi
        </h1>

        <p className="subtitle slide-up delay-2">
          AI-Powered Scheme Discovery & Eligibility Matching Engine
        </p>

        <p className="description slide-up delay-2">
          Instantly discover welfare schemes tailored for your profile (Farmers, Students, Women, Workers), calculate precise eligibility rules, and track Direct Benefit Transfers (DBT) seamlessly.
        </p>

        <div className="stats-strip slide-up delay-3">
          <div className="stat-item">
            <span className="num">500+</span>
            <span className="lbl">Verified Schemes</span>
          </div>
          <div className="divider"></div>
          <div className="stat-item">
            <span className="num">99.2%</span>
            <span className="lbl">Matching Accuracy</span>
          </div>
          <div className="divider"></div>
          <div className="stat-item">
            <span className="num">₹24,000Cr+</span>
            <span className="lbl">Benefits Tracked</span>
          </div>
        </div>

        <div className="action-buttons slide-up delay-4">
          <button 
            className="get-started-btn"
            onClick={() => navigate('/login')}
          >
            <span>Launch Scheme Engine</span>
            <ArrowRight size={18} />
          </button>
          <button 
            className="explore-btn"
            onClick={() => navigate('/landing')}
          >
            <Sparkles size={16} />
            <span>Explore Features</span>
          </button>
        </div>
      </div>

      <div className="footer-credits fade-in delay-4">
        <span>Yojana Sarthi Digital Initiative</span>
        <span className="dot">•</span>
        <span>Secure Aadhaar & DigiLocker Integrated</span>
      </div>
    </div>
  );
};

export default StartingPage;
