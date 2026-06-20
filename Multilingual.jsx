import React, { useState } from 'react';
import './Multilingual.css';

const Multilingual = () => {
  const [selectedLang, setSelectedLang] = useState('English');

  const languages = [
    { name: 'English', native: 'English', code: 'en' },
    { name: 'Hindi', native: 'हिन्दी', code: 'hi' },
    { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn' },
    { name: 'Tamil', native: 'தமிழ்', code: 'ta' },
    { name: 'Telugu', native: 'తెలుగు', code: 'te' },
    { name: 'Bengali', native: 'বাংলা', code: 'bn' },
    { name: 'Marathi', native: 'मराठी', code: 'mr' },
    { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu' }
  ];

  return (
    <div className="multilingual-page">
      <h1>Language & Accessibility</h1>
      
      <div className="lang-section">
        <h3>Primary Dashboard Language</h3>
        <div className="lang-grid">
          {languages.map(lang => (
            <button 
              key={lang.code}
              className={`lang-card ${selectedLang === lang.name ? 'active' : ''}`}
              onClick={() => setSelectedLang(lang.name)}
            >
              <span className="native-text">{lang.native}</span>
              <span className="lang-text">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="accessibility-checklist">
        <h3>Accessibility Checklist</h3>
        <div className="checklist-grid">
          {[
            'Screen-reader friendly titles',
            'High contrast text (WCAG AAA)',
            'Large clickable touch targets',
            'Audio-visual sync for cues',
            'Simplified navigation flow',
            'Braille keyboard support integration'
          ].map((item, i) => (
            <div key={i} className="check-item">
              <input type="checkbox" id={`check-${i}`} defaultChecked={i < 4} />
              <label htmlFor={`check-${i}`}>{item}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Multilingual;
