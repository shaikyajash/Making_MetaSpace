// src/components/Navbar.jsx
import React, { useState } from 'react';
import "./Navbar.css";

const Navbar = ({ onToggleChat, isChatOpen, videoEnabled, audioEnabled, onToggleVideo, onToggleAudio }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        {/* Add other navbar items here */}
      </div>
      <div className="navbar-right">
        <button 
          className={`nav-button ${videoEnabled ? 'active' : ''}`}
          onClick={onToggleVideo}
        >
          {videoEnabled ? '🎥' : '🚫'}
        </button>
        <button 
          className={`nav-button ${audioEnabled ? 'active' : ''}`}
          onClick={onToggleAudio}
        >
          {audioEnabled ? '🎤' : '🔇'}
        </button>
        <button 
          className={`nav-button ${isChatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default Navbar;