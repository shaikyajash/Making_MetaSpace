import React, { useState } from 'react'
import ChatPanel from '../components/ChatPanel';
import GameWrapper from '../components/GameWrapper';
import Navbar from '../components/Navbar.jsx';

const GameScreen = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
  
    const handleToggleChat = () => {
      setIsChatOpen(!isChatOpen);
    };
  
    const handleToggleVideo = () => {
      setVideoEnabled(!videoEnabled);
    };
  
    const handleToggleAudio = () => {
      setAudioEnabled(!audioEnabled);
    };
  
    return (
      <>
      <div className='Game'  >
  
    <GameWrapper/>
      </div>
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          videoEnabled={videoEnabled}
          audioEnabled={audioEnabled}
        />
        <Navbar
          onToggleChat={handleToggleChat}
          isChatOpen={isChatOpen}
          videoEnabled={videoEnabled}
          audioEnabled={audioEnabled}
          onToggleVideo={handleToggleVideo}
          onToggleAudio={handleToggleAudio}
        />



      </>
    );
}

export default GameScreen