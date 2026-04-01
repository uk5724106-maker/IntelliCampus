import React, { useState, useEffect } from 'react';
import './Communication.css';

export default function Communication() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'admin', text: 'Welcome to the Smart Campus Helpdesk! How can we assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/communication/history');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const token = localStorage.getItem('campus_token');
    setInput('');
    
    // Optimistic update
    const tempMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch('/api/communication/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, text: input })
      });
      // Poll back to get admin response
      setTimeout(fetchMessages, 1500); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comm-wrapper animate-fade-in">
      <div className="comm-header">
        <h2>Communication Hub</h2>
        <p>Raise issues, ask questions, or view announcements</p>
      </div>

      <div className="chat-container box-shadow">
        <div className="chat-header">
          Admin Support Channel (Live Mock)
        </div>
        
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="input-message" 
            placeholder="Type your issue or query here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}
