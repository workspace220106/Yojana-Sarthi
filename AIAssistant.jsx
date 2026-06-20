import React, { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Namaste! I am Bharat AI. How can I help you today?', time: '10:00 AM' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { type: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'Based on your profile as a farmer in Karnataka, you are eligible for the PM-KISAN Samman Nidhi. Would you like to see the application details?',
        reasoning: { match: 98, reason: 'Identified as adult farmer with landholding record in DigiLocker.' },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1500);
  };

  return (
    <div className="ai-assistant-page">
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.type}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                {msg.reasoning && (
                  <div className="reasoning-card">
                    <div className="match-score">
                      <div className="score-ring" style={{'--score': msg.reasoning.match}}>
                        {msg.reasoning.match}% Match
                      </div>
                    </div>
                    <div className="reason-text">{msg.reasoning.reason}</div>
                  </div>
                )}
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>

        <div className="suggested-prompts">
          {['Check eligibility', 'Track application', 'Document help'].map(p => (
            <button key={p} onClick={() => setInput(p)}>{p} ⚡</button>
          ))}
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type your question in Hindi, English, or Kannada..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="btn-send" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
