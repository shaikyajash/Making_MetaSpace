// src/components/ChatPanel.jsx
import React, { useState, useRef } from 'react';
import "./ChatPanel.css";

const ChatPanel = ({ isOpen, onClose, videoEnabled, audioEnabled }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'me' }]);
      setNewMessage('');
    }
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>Chat & Video</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="video-container">
        {videoEnabled && (
          <div className="video-grid">
            <video ref={videoRef} autoPlay muted playsInline />
            {/* Add other participant videos here */}
          </div>
        )}
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSendMessage} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;