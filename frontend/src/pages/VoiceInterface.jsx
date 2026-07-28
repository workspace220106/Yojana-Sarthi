import React, { useState, useEffect } from 'react';
import './VoiceInterface.css';

const VoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('English');

  const startListening = () => {
    setIsListening(true);
    setTranscript('Listening...');
    setTimeout(() => {
      setTranscript('How many schemes are available for girls education?');
      setIsListening(false);
    }, 3000);
  };

  return (
    <div className="voice-interface-page">
      <div className="voice-control-panel">
        <div className="lang-selector">
          {['English', 'Hindi', 'Kannada'].map(l => (
            <button 
              key={l} 
              className={language === l ? 'active' : ''}
              onClick={() => setLanguage(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className={`waveform-container ${isListening ? 'animating' : ''}`}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <div className="voice-actions">
          <button 
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={startListening}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
          <p className="status-text">{isListening ? 'Speak now...' : 'Tap mic to speak'}</p>
        </div>

        {transcript && (
          <div className="transcript-box">
            <h3>Transcript</h3>
            <p>"{transcript}"</p>
          </div>
        )}
      </div>

      <div className="accessibility-checks">
        <h3>Accessibility Toolkit</h3>
        <div className="check-item">
          <input type="checkbox" id="screen-reader" />
          <label htmlFor="screen-reader">Screen Reader Optimization</label>
        </div>
        <div className="check-item">
          <input type="checkbox" id="high-contrast" />
          <label htmlFor="high-contrast">High Contrast Mode</label>
        </div>
        <div className="check-item">
          <input type="checkbox" id="text-size" />
          <label htmlFor="text-size">Large Text Scale</label>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
