// frontend/src/components/GameWrapper.jsx
import React, { useEffect } from 'react';
import initGame from '../initGame';
import { useSocket } from '../context/SocketConmtext';
import './GameWrapper.css';

const GameWrapper = () => {
  const { socket, playerId, players } = useSocket();

  useEffect(() => {
    if (!socket || !playerId) return;

    // Initialize game and get cleanup function
    const cleanup = initGame(socket, playerId, players);

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [socket, playerId, players]);

  return <canvas id="game" />;
};

export default GameWrapper;