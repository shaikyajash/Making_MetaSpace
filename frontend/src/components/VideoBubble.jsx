
import React from 'react';
import './VideoBubble.css';

const VideoBubble = ({ videoRef, isLocal }) => {
  return (
    <div className="video-bubble">
      <video 
        ref={videoRef} 
        autoPlay 
        muted={isLocal} 
        playsInline
      />
    </div>
  );
};

export default VideoBubble;