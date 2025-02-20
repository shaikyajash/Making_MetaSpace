// src/components/Navbar.jsx
import React from 'react';
import "./Navbar.css";

const Navbar = ({ onToggleChat, isChatOpen, videoEnabled, audioEnabled, onToggleVideo, onToggleAudio }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">MetaSpace</span>
      </div>
      <div className="navbar-right">
        <button 
          className={`nav-button ${videoEnabled ? 'active' : ''}`}
          onClick={onToggleVideo}
          title={videoEnabled ? "Disable video" : "Enable video"}
        >
          {/* Video button SVG */}
        </button>
        <button 
          className={`nav-button ${audioEnabled ? 'active' : ''}`}
          onClick={onToggleAudio}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {/* Audio button SVG */}
        </button>
        <button 
          className={`nav-button ${isChatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
          title={isChatOpen ? "Close chat" : "Open chat"}
        >
          {/* Chat button SVG */}
        </button>
      </div>
    </div>
  );
};

export default Navbar;