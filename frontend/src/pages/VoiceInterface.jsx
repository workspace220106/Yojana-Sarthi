import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Languages, AlertCircle, HelpCircle, CornerDownLeft } from 'lucide-react';
import './VoiceInterface.css';

const VoiceInterface = () => {
  const [language, setLanguage] = useState('mr-IN'); // Default to Marathi
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [profile, setProfile] = useState(null);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language;

    rec.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      setInterimTranscript('');
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(final);
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please check site permissions.');
      } else {
        setError(`Speech recognition failed: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // 2. Load Profile
    const saved = localStorage.getItem('yojana_sarthi_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any playing TTS audio first
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setAiResponse('');
      recognitionRef.current.start();
    }
  };

  // Trigger search after final transcript is captured
  useEffect(() => {
    if (transcript && !isListening) {
      handleQueryAI(transcript);
    }
  }, [transcript, isListening]);

  const handleQueryAI = async (queryText) => {
    setLoading(true);
    setAiResponse('');
    
    try {
      // Construct context-rich query using active profile parameters
      let fullQuery = queryText;
      if (profile) {
        const ageVal = profile.age ? `${profile.age} years old` : 'Not specified';
        const incomeVal = profile.income ? `annual income ₹${profile.income}` : 'Not specified';
        const contextStr = `[Profile Context: Age: ${ageVal}, Income: ${incomeVal}, Occupation: ${profile.occupation || 'N/A'}, Category: ${profile.category || 'N/A'}, Gender: ${profile.gender || 'N/A'}, State: ${profile.state || 'Maharashtra'}]`;
        fullQuery = `${contextStr} ${queryText}`;
      }

      // Query AI Assistant
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullQuery })
      });

      if (!res.ok) throw new Error('AI Server responded with an error');
      const data = await res.json();
      
      const responseText = data.response || 'No response';
      setAiResponse(responseText);
      
      // Auto play TTS response
      speakText(responseText);
    } catch (err) {
      console.error(err);
      setAiResponse('Communication failure. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text) => {
    if (!text) return;
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setIsPlaying(true);

    try {
      const langCode = language.split('-')[0]; // "en", "hi", "mr"
      const res = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: langCode })
      });

      if (!res.ok) throw new Error('Backend TTS service failed');
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error('Backend TTS failed, trying browser native SpeechSynthesis:', err);
      
      // Browser SpeechSynthesis Fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const getLanguageName = (code) => {
    switch (code) {
      case 'en-IN': return 'English';
      case 'hi-IN': return 'हिन्दी (Hindi)';
      case 'mr-IN': return 'मराठी (Marathi)';
      default: return 'English';
    }
  };

  return (
    <div className="voice-interface-page">
      <div className="voice-header">
        <div className="header-badge">
          <Languages size={16} />
          <span>Multilingual Voice Portal</span>
        </div>
        <h1>Speak to Yojana Sarthi</h1>
        <p className="subtitle">
          Query welfare programs, check rules, and obtain scheme matching advice using natural voice control.
        </p>
      </div>

      <div className="voice-control-panel">
        {/* Language Tabs */}
        <div className="voice-lang-selector">
          {['mr-IN', 'hi-IN', 'en-IN'].map(langCode => (
            <button
              key={langCode}
              className={`voice-lang-btn ${language === langCode ? 'active' : ''}`}
              onClick={() => {
                setLanguage(langCode);
                stopAudio();
                setTranscript('');
                setAiResponse('');
              }}
              disabled={isListening}
            >
              {getLanguageName(langCode)}
            </button>
          ))}
        </div>

        {/* Waveform Visualization */}
        <div className={`voice-waveform ${isListening ? 'active' : ''}`}>
          <div className="w-bar bar-1"></div>
          <div className="w-bar bar-2"></div>
          <div className="w-bar bar-3"></div>
          <div className="w-bar bar-4"></div>
          <div className="w-bar bar-5"></div>
          <div className="w-bar bar-6"></div>
          <div className="w-bar bar-7"></div>
          <div className="w-bar bar-8"></div>
        </div>

        {/* Mic Activation Button */}
        <div className="voice-action-center">
          <button 
            className={`voice-mic-trigger ${isListening ? 'recording' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          <p className="status-tip">
            {isListening 
              ? 'Listening... Speak clearly into your mic.' 
              : `Tap the mic to ask a question in ${getLanguageName(language).split(' (')[0]}`}
          </p>
        </div>

        {/* Error Block */}
        {error && (
          <div className="voice-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript Box */}
        {(transcript || interimTranscript) && (
          <div className="voice-transcript-wrapper">
            <span className="box-lbl">Your Question</span>
            <p className="transcript-text">
              {transcript || <span className="interim">{interimTranscript}...</span>}
            </p>
          </div>
        )}
      </div>

      {/* AI Response Display Card */}
      {(loading || aiResponse) && (
        <div className="voice-response-card">
          <div className="response-header-row">
            <div className="ai-meta">
              <Sparkles size={18} className="sparkle-icon" />
              <span>Yojana Sarthi AI Response</span>
            </div>
            {aiResponse && (
              <button 
                className={`tts-playback-control-btn ${isPlaying ? 'playing' : ''}`}
                onClick={isPlaying ? stopAudio : () => speakText(aiResponse)}
                title={isPlaying ? "Stop Speaking" : "Listen Response"}
              >
                {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{isPlaying ? 'Mute' : 'Listen'}</span>
              </button>
            )}
          </div>
          
          <div className="response-body-area">
            {loading ? (
              <div className="response-skeleton-loader">
                <div className="s-line"></div>
                <div className="s-line short"></div>
              </div>
            ) : (
              <p className="response-para">{aiResponse}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
