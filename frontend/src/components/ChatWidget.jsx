import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, Bot, User, ShieldCheck, Mic, MicOff } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './ChatWidget.css';

/**
 * Renders AI response text with proper markdown formatting:
 * - ### Headings, **bold**, *italic*, bullet/numbered lists, links, separators
 */
const MarkdownMessage = ({ text }) => {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className="chat-list">
          {listItems.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: li }} />
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  const fmt = (str) =>
    str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');

  lines.forEach((line) => {
    const t = line.trim();
    if (!t) { flushList(); return; }

    if (/^---+$/.test(t)) {
      flushList();
      elements.push(<hr key={`hr-${elements.length}`} className="chat-divider" />);
      return;
    }
    if (/^###\s/.test(t)) {
      flushList();
      elements.push(<h4 key={`h3-${elements.length}`} className="chat-heading" dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^###\s*/, '')) }} />);
      return;
    }
    if (/^##\s/.test(t)) {
      flushList();
      elements.push(<h3 key={`h2-${elements.length}`} className="chat-heading-lg" dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^##\s*/, '')) }} />);
      return;
    }
    const bullet = t.match(/^[*\-]\s+(.*)/);
    if (bullet) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(fmt(bullet[1]));
      return;
    }
    const numbered = t.match(/^\d+\.\s+(.*)/);
    if (numbered) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listItems.push(fmt(numbered[1]));
      return;
    }
    flushList();
    elements.push(<p key={`p-${elements.length}`} className="chat-para" dangerouslySetInnerHTML={{ __html: fmt(t) }} />);
  });

  flushList();
  return <div className="chat-markdown">{elements}</div>;
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Namaste! I am Yojana Sarthi, your government scheme assistant.\n\nAsk me about:\n- Scholarships and education benefits\n- Farmer and agricultural schemes\n- Health and welfare programs\n- Women and child development\n- Housing and infrastructure schemes',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState(null);
  const [voiceLang, setVoiceLang] = useState('mr-IN'); // Default Marathi
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const VOICE_LANGS = [
    { code: 'mr-IN', label: 'मराठी' },
    { code: 'hi-IN', label: 'हिन्दी' },
    { code: 'en-IN', label: 'English' },
  ];

  const initRecognition = (lang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    return rec;
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = initRecognition(voiceLang);
    if (!rec) { alert('Voice input not supported in this browser. Please use Chrome.'); return; }
    recognitionRef.current = rec;
    rec.start();
  };

  useEffect(() => {
    const saved = localStorage.getItem('yojana_sarthi_profile');
    if (saved) { try { setProfile(JSON.parse(saved)); } catch (e) {} }

    // Sync voiceLang with current site language
    const currentLang = localStorage.getItem('yojana_sarthi_lang') || 'mr';
    if (currentLang === 'hi') setVoiceLang('hi-IN');
    else if (currentLang === 'en') setVoiceLang('en-IN');
    else setVoiceLang('mr-IN');

    const handleLangChange = (e) => {
      const code = e.detail;
      if (code === 'hi') setVoiceLang('hi-IN');
      else if (code === 'en') setVoiceLang('en-IN');
      else setVoiceLang('mr-IN');
    };

    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, {
      type: 'user', text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
    setIsTyping(true);

    try {
      let fullQuery = userMsg;
      if (profile) {
        const ctx = `[Profile: Age ${profile.age || 'N/A'}, Income Rs.${profile.income || 'N/A'}, Occupation: ${profile.occupation || 'N/A'}, Category: ${profile.category || 'N/A'}, Gender: ${profile.gender || 'N/A'}, State: ${profile.state || 'Maharashtra'}]`;
        fullQuery = `${ctx} ${userMsg}`;
      }
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullQuery })
      });
      setIsTyping(false);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      const replyText = data.response || data.raw_response || "I couldn't find matching schemes. Please rephrase your query.";
      setMessages(prev => [...prev, {
        type: 'ai', text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: `**Connection Error**\n\nCould not reach the AI service. Please try again in a moment.\n\n- ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chat-fab ${isOpen ? 'fab-active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Yojana Sarthi AI Assistant"
        aria-label="Open AI Scheme Assistant"
      >
        <div className="fab-icon-wrapper">
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </div>
        {!isOpen && <span className="fab-badge-label">Ask AI</span>}
        {!isOpen && <span className="fab-ping-ring" />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="cw-window">
          {/* Header */}
          <div className="cw-header">
            <div className="cw-header-left">
              <img src={emblem} alt="Govt Emblem" className="cw-emblem" />
              <div>
                <div className="cw-title">Yojana Sarthi</div>
                <div className="cw-subtitle">
                  <span className="cw-live-dot" /> AI Scheme Assistant
                </div>
              </div>
            </div>
            <div className="cw-header-right">
              <span className="cw-verified-badge"><ShieldCheck size={12} /> Official</span>
              <button className="cw-minimize" onClick={() => setIsOpen(false)} title="Minimize">
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Profile Context Banner */}
          {profile && (
            <div className="cw-profile-banner">
              <div className="cw-tricolor-bar" />
              <span>
                Context: <strong>{profile.occupation || 'Citizen'}</strong> · {profile.age} yrs · {profile.category} · {profile.state || 'Maharashtra'}
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="cw-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cw-msg-row ${msg.type}`}>
                <div className={`cw-avatar ${msg.type}`}>
                  {msg.type === 'ai' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={`cw-bubble ${msg.type}`}>
                  {msg.type === 'ai' ? (
                    <MarkdownMessage text={msg.text} />
                  ) : (
                    <p className="cw-user-text">{msg.text}</p>
                  )}
                  <span className="cw-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="cw-msg-row ai">
                <div className="cw-avatar ai"><Bot size={14} /></div>
                <div className="cw-bubble ai cw-typing-bubble">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Language Selector + Input */}
          <div className="cw-voice-lang-row">
            {VOICE_LANGS.map(vl => (
              <button
                key={vl.code}
                className={`cw-vlang-btn ${voiceLang === vl.code ? 'active' : ''}`}
                onClick={() => { setVoiceLang(vl.code); if (isListening) recognitionRef.current?.stop(); }}
              >
                {vl.label}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="cw-input-row">
            <button
              className={`cw-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoice}
              title={isListening ? 'Stop listening' : `Speak in ${VOICE_LANGS.find(v=>v.code===voiceLang)?.label}`}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? 'Listening...' : 'Ask about schemes, eligibility...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="cw-input"
            />
            <button
              className={`cw-send ${isTyping || !input.trim() ? 'disabled' : ''}`}
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              title="Send"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
