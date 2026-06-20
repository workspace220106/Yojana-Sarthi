import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartingPage.css';
import emblem from '../assets/images/emblem.png';
import bgPattern from '../assets/images/start-bg.png';

const StartingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="starting-page" style={{ backgroundImage: `url(${bgPattern})` }}>
      <div className="overlay"></div>
      <div className="content">
        <div className="emblem-container fade-in">
          <img src={emblem} alt="Government Emblem" className="emblem" />
        </div>
        <h1 className="title slide-up">Yojana Sarthi</h1>
        <p className="subtitle slide-up delay-1">
          AI-Powered Government Scheme Eligibility Engine
        </p>
        <button 
          className="get-started-btn slide-up delay-2"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
      <div className="footer-credits fade-in delay-3">
        Government of India | Citizen Service Portal
      </div>
    </div>
  );
};

export default StartingPage;
