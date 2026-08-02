import React, { useState, useEffect } from 'react';
import { Send, User, ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      type: 'ai', 
      text: 'Namaste! Welcome to Yojana Sarthi Citizen Support. Please state your query (e.g., "scholarships for students" or "crop benefits for farmers") to inspect eligible government welfare programs.', 
      time: '10:00 AM' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState(null);

  // Load synced citizen profile for context injection
  useEffect(() => {
    const saved = localStorage.getItem('yojana_sarthi_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { 
      type: 'user', 
      text: userMsg, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
    setIsTyping(true);
    
    try {
      // 1. Construct context-rich query using active profile parameters
      let fullQuery = userMsg;
      if (profile) {
        const ageVal = profile.age ? `${profile.age} years old` : 'Not specified';
        const incomeVal = profile.income ? `annual income ₹${profile.income}` : 'Not specified';
        const contextStr = `[Profile Context: Age: ${ageVal}, Income: ${incomeVal}, Occupation: ${profile.occupation || 'N/A'}, Category: ${profile.category || 'N/A'}, Gender: ${profile.gender || 'N/A'}, State: ${profile.state || 'Maharashtra'}]`;
        fullQuery = `${contextStr} ${userMsg}`;
      }

      // 2. Fetch from RAG chat endpoint
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: fullQuery })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      const replyText = data.response || data.raw_response || "I couldn't find any schemes in our database matching your request.";

      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: replyText,
        eligible: data.eligible || [],
        ineligible: data.ineligible || [],
        sources: data.sources || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      const errorDetail = err.message || 'Unknown error';
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Sorry, I could not connect to the Yojana Sarthi AI service. Please try again in a moment. (${errorDetail})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  };

  return (
    <div className="ai-assistant-page">
      <div className="assistant-header">
        <div className="header-left">
          <div className="emblem-mini-box">
            <img src={emblem} alt="Government Emblem" className="mini-emblem" />
          </div>
          <div>
            <h2>Yojana Sarthi — Citizen Support Assistant</h2>
            <span className="subtitle-text">Official Public Helpline & Scheme Eligibility Assistance</span>
          </div>
        </div>
        <div className="gov-badge">
          <ShieldCheck size={16} />
          <span>Verified Government Portal</span>
        </div>
      </div>

      {/* Profile Context Banner */}
      {profile && (
        <div className="profile-context-banner">
          <span className="banner-tricolor-indicator"></span>
          <span className="banner-txt">
            <strong>Context Injection Active:</strong> Assistant is analyzing schemes using your linked profile (
            {profile.occupation || 'Farmer'} • {profile.age || '34'} Years • {profile.category || 'OBC'} • {profile.state || 'Maharashtra'}
            )
          </span>
        </div>
      )}

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.type}`}>
              <div className="avatar-icon">
                {msg.type === 'ai' ? 'YS' : <User size={16} />}
              </div>
              <div className="message-bubble">
                <p className="msg-text-paragraph">{msg.text}</p>
                
                {/* Eligible Schemes List */}
                {msg.eligible && msg.eligible.length > 0 && (
                  <div className="chat-schemes-section eligible">
                    <div className="section-title">
                      <CheckCircle2 size={16} className="icon-success" />
                      <span>Eligible Schemes Matches ({msg.eligible.length})</span>
                    </div>
                    <div className="schemes-grid">
                      {msg.eligible.map((sch, idx) => (
                        <div key={idx} className="scheme-item-card eligible">
                          <h5>{sch.scheme_name}</h5>
                          <div className="card-badge-row">
                            <span className="badge">{sch.schemeCategory}</span>
                            <span className="badge level">{sch.level}</span>
                          </div>
                          <p className="desc">{sch.details}</p>
                          <div className="section-details">
                            <div className="detail-item"><strong>Benefits:</strong> <p>{sch.benefits}</p></div>
                            <div className="detail-item"><strong>Eligibility Rules:</strong> <p>{sch.eligibility}</p></div>
                            <div className="detail-item"><strong>Required Documents:</strong> <p>{sch.documents || 'Aadhaar Card, Caste Certificate'}</p></div>
                            <div className="detail-item"><strong>Application Steps:</strong> <p>{sch.application}</p></div>
                          </div>
                          {sch.official_website && sch.official_website !== 'Information not available.' && (
                            <a href={sch.official_website} target="_blank" rel="noopener noreferrer" className="btn-visit">
                              Apply on Official Site
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ineligible Schemes List */}
                {msg.ineligible && msg.ineligible.length > 0 && (
                  <div className="chat-schemes-section ineligible">
                    <div className="section-title">
                      <AlertTriangle size={16} className="icon-warning" />
                      <span>Ineligible Schemes ({msg.ineligible.length})</span>
                    </div>
                    <div className="schemes-grid">
                      {msg.ineligible.map((sch, idx) => (
                        <div key={idx} className="scheme-item-card ineligible">
                          <h5>{sch.scheme_name}</h5>
                          <span className="badge level">{sch.schemeCategory}</span>
                          <div className="failed-reasons-block">
                            <strong>Disqualification Reasons:</strong>
                            <ul>
                              {sch.failed_reasons.map((reason, rIdx) => (
                                <li key={rIdx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="chat-sources-block">
                    <span className="sources-lbl">Sources Cited:</span>
                    <div className="sources-list">
                      {msg.sources.map((src, srcIdx) => (
                        <span key={srcIdx} className="source-tag" title={`Match Score: ${src.score.toFixed(4)}`}>
                          📚 {src.title} ({src.level || 'State'})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper ai">
              <div className="avatar-icon">YS</div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type your question or query here (e.g. farmer schemes in Maharashtra, income under 2 lakhs)..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="btn-send" onClick={sendMessage}>
            <span>Submit</span>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
