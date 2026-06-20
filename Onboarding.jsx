import React, { useState } from 'react';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="step-content">
            <h2>Welcome to BharatGov</h2>
            <p>Let's personalize your experience. First, tell us your age group.</p>
            <div className="options-grid">
              {['18-25', '26-40', '41-60', '60+'].map(age => (
                <button key={age} className="option-card">{age}</button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h2>Financial Profile</h2>
            <p>Adjust the slider to your annual household income (in Lakhs).</p>
            <div className="slider-container">
              <input type="range" min="0" max="50" step="1" className="income-slider" />
              <div className="slider-labels">
                <span>₹0L</span>
                <span>₹50L+</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h2>Occupation</h2>
            <p>What is your primary source of livelihood?</p>
            <div className="options-grid">
              {['Farmer', 'Salaried', 'Self-Employed', 'Student', 'Retired'].map(occ => (
                <button key={occ} className="option-card">{occ}</button>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="step-content">
            <h2>Step {step}</h2>
            <p>This part of the onboarding wizard is coming soon with detailed document checklists and verification steps.</p>
          </div>
        );
    }
  };

  return (
    <div className="onboarding-page">
      <div className="progress-container">
        <div className="progress-header">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step/totalSteps)*100)}% Complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step/totalSteps)*100}%` }}></div>
        </div>
      </div>

      <div className="wizard-box">
        {renderStep()}
        
        <div className="wizard-actions">
          <button 
            className="btn-back" 
            onClick={prevStep} 
            disabled={step === 1}
          >
            Previous
          </button>
          <button 
            className="btn-next" 
            onClick={nextStep}
          >
            {step === totalSteps ? 'Finish' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
