import React, { useState } from 'react';
import { Send, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      type: 'ai', 
      text: 'Namaste! Welcome to Yojana Sarthi Citizen Support. Please state your query or details (e.g. age, occupation, income) to inquire about eligible government schemes.', 
      time: '10:00 AM' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { 
      type: 'user', 
      text: userMsg, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Regarding your query "${userMsg}", your profile details match the eligibility rules for PM-KISAN Samman Nidhi and Mahatma Jyotirao Phule Shetkari Karjmukti Yojana.`,
        reasoning: { 
          match: 96, 
          reason: 'Verified agricultural criteria & DigiLocker landholding record.' 
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1200);
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

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.type}`}>
              <div className="avatar-icon">
                {msg.type === 'ai' ? 'YS' : <User size={16} />}
              </div>
              <div className="message-bubble">
                <p>{msg.text}</p>
                {msg.reasoning && (
                  <div className="reasoning-card">
                    <div className="match-score">
                      <CheckCircle2 size={15} className="icon-check" />
                      <span>{msg.reasoning.match}% Eligibility Match</span>
                    </div>
                    <p className="reason-text">{msg.reasoning.reason}</p>
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
