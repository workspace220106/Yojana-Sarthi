import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, DollarSign, Briefcase, Users, Award, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import './Onboarding.css';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '26-40',
    income: '2.5',
    occupation: 'Farmer',
    category: 'OBC',
    gender: 'Male'
  });

  const totalSteps = 5;

  const nextStep = async () => {
    if (step === totalSteps) {
      const savedProfile = localStorage.getItem('yojana_sarthi_profile');
      let currentProfile = savedProfile ? JSON.parse(savedProfile) : {};
      
      currentProfile.age = formData.age.includes('-') ? formData.age.split('-')[0] : formData.age.replace(/\D/g,'');
      currentProfile.income = String(parseFloat(formData.income) * 100000);
      currentProfile.occupation = formData.occupation;
      currentProfile.category = formData.category;
      currentProfile.gender = formData.gender;
      
      localStorage.setItem('yojana_sarthi_profile', JSON.stringify(currentProfile));
      
      // Save to Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await setDoc(doc(db, 'citizens', currentUser.uid), {
            id: currentUser.uid,
            full_name: currentProfile.fullName || 'Citizen',
            aadhaar: currentProfile.aadhaar || '',
            phone: currentProfile.phone || '',
            state: currentProfile.state || 'Maharashtra',
            address: currentProfile.address || '',
            age: currentProfile.age ? parseInt(currentProfile.age) : null,
            income: currentProfile.income ? parseInt(currentProfile.income) : null,
            occupation: currentProfile.occupation,
            category: currentProfile.category,
            gender: currentProfile.gender,
            verification_status: currentProfile.verification_status || 'Unverified',
            data_sources: currentProfile.data_sources || ['User Input'],
            documents: currentProfile.documents || []
          }, { merge: true });
        } catch (err) {
          console.error("Failed to save onboarding parameters to Firebase:", err);
        }
      }

      // Dispatch custom profileUpdate event
      window.dispatchEvent(new Event('profileUpdate'));
      
      navigate('/landing');
    } else {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header-block">
              <User size={32} className="step-icon" />
              <h2>Welcome to Yojana Sarthi Profile Setup</h2>
              <p>Let's personalize your scheme eligibility profile. First, select your age group.</p>
            </div>
            <div className="options-grid">
              {['18-25', '26-40', '41-60', '60+'].map(age => (
                <button 
                  key={age} 
                  className={`option-card ${formData.age === age ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, age })}
                >
                  <span className="opt-title">{age} Years</span>
                  <span className="opt-desc">{age === '60+' ? 'Senior Citizen Benefits' : 'Active Workforce'}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div className="step-header-block">
              <DollarSign size={32} className="step-icon" />
              <h2>Annual Household Income</h2>
              <p>Select your annual family income bracket to calculate scheme income ceilings.</p>
            </div>
            <div className="slider-container">
              <div className="income-display">
                <span className="lbl">Selected Income Limit:</span>
                <span className="val">₹{formData.income} Lakhs / Year</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="15" 
                step="0.5" 
                value={formData.income}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                className="income-slider" 
              />
              <div className="slider-labels">
                <span>₹50,000</span>
                <span>₹8 Lakhs (NCL Ceiling)</span>
                <span>₹15 Lakhs+</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div className="step-header-block">
              <Briefcase size={32} className="step-icon" />
              <h2>Primary Occupation</h2>
              <p>Which sector represents your main source of income?</p>
            </div>
            <div className="options-grid">
              {[
                { title: 'Farmer / Agriculture', desc: 'Crop loans, PM-KISAN, seeds' },
                { title: 'Student', desc: 'Scholarships, fee waivers' },
                { title: 'Construction Worker', desc: 'MBOCWW welfare benefits' },
                { title: 'Self-Employed / Business', desc: 'Mudra loan, PMEGP' },
                { title: 'Unemployed', desc: 'Skill development programs' }
              ].map(occ => (
                <button 
                  key={occ.title} 
                  className={`option-card ${formData.occupation === occ.title ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, occupation: occ.title })}
                >
                  <span className="opt-title">{occ.title}</span>
                  <span className="opt-desc">{occ.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <div className="step-header-block">
              <Users size={32} className="step-icon" />
              <h2>Social Category</h2>
              <p>Select your reservation category for specific affirmative action benefits.</p>
            </div>
            <div className="options-grid">
              {['General', 'SC', 'ST', 'OBC', 'VJNT', 'PwD'].map(cat => (
                <button 
                  key={cat} 
                  className={`option-card ${formData.category === cat ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat })}
                >
                  <span className="opt-title">{cat}</span>
                  <span className="opt-desc">Category Certificate Required</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <div className="step-header-block">
              <Award size={32} className="step-icon" />
              <h2>Profile Summary & DigiLocker Verification</h2>
              <p>Review your configured parameters before generating scheme matches.</p>
            </div>
            <div className="summary-card">
              <div className="summary-row">
                <span>Age Group:</span> <strong>{formData.age} Years</strong>
              </div>
              <div className="summary-row">
                <span>Annual Income:</span> <strong>₹{formData.income} Lakhs</strong>
              </div>
              <div className="summary-row">
                <span>Occupation:</span> <strong>{formData.occupation}</strong>
              </div>
              <div className="summary-row">
                <span>Social Category:</span> <strong>{formData.category}</strong>
              </div>
              <div className="digilocker-badge">
                <ShieldCheck size={18} />
                <span>DigiLocker Auto-Sync Enabled</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page">
      <div className="progress-container">
        <div className="progress-header">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step/totalSteps)*100)}% Profile Complete</span>
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
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>
          <button 
            className="btn-next" 
            onClick={nextStep}
          >
            <span>{step === totalSteps ? 'View Matched Schemes' : 'Next Step'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
