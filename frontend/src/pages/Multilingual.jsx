import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CheckCircle2, Languages, HelpCircle } from 'lucide-react';
import './Multilingual.css';

const Multilingual = () => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'mr');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const languages = [
    { name: 'English', native: 'English', code: 'en' },
    { name: 'Hindi', native: 'हिन्दी', code: 'hi' },
    { name: 'Marathi', native: 'मराठी', code: 'mr' }
  ];

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('yojana_sarthi_lang', code);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="multilingual-page">
      <div className="multilingual-header">
        <div className="header-badge">
          <Languages size={16} />
          <span>{t('multilingual.title')}</span>
        </div>
        <h1>{t('multilingual.title')}</h1>
        <p className="subtitle">{t('multilingual.subtitle')}</p>
      </div>

      <div className="lang-section-card">
        <h3>{t('multilingual.select')}</h3>
        <div className="lang-grid-wrapper">
          {languages.map(lang => {
            const isActive = selectedLang === lang.code;
            return (
              <button 
                key={lang.code}
                className={`lang-select-card ${isActive ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <div className="card-top">
                  <div className={`checkbox-circle ${isActive ? 'checked' : ''}`}>
                    {isActive && <CheckCircle2 size={16} />}
                  </div>
                </div>
                <span className="native-text">{lang.native}</span>
                <span className="lang-text">{lang.name}</span>
              </button>
            );
          })}
        </div>

        {saveSuccess && (
          <div className="toast-success-banner">
            <CheckCircle2 size={18} />
            <span>{t('multilingual.success')}</span>
          </div>
        )}
      </div>

      {/* Accessibility Section */}
      <div className="accessibility-checklist">
        <h3>Accessibility Checks</h3>
        <div className="checklist-grid">
          {[
            'Screen-reader friendly layouts',
            'Contrast text alignment (WCAG AA)',
            'Large clickable button elements',
            'Web Speech API integration',
            'Simplified scheme planner steps',
            'Multilingual voice guidance support'
          ].map((item, i) => (
            <div key={i} className="check-item-row">
              <div className="indicator-dot checked"></div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Multilingual;
