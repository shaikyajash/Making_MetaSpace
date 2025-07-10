// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState(new Map());

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('INIT', (data) => {
      setPlayerId(data.playerId);
      const playerMap = new Map();
      data.players.forEach(player => {
        if (player.id !== data.playerId) {
          playerMap.set(player.id, player);
        }
      });
      setPlayers(playerMap);
    });

    newSocket.on('PLAYER_JOINED', (data) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.set(data.player.id, data.player);
        return newPlayers;
      });
    });

    newSocket.on('PLAYER_UPDATED', (data) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        const player = newPlayers.get(data.playerId);
        if (player) {
          newPlayers.set(data.playerId, {
            ...player,
            position: data.position,
            animation: data.animation
          });
        }
        return newPlayers;
      });
    });

    newSocket.on('PLAYER_LEFT', (data) => {
      setPlayers(prev => {
        const newPlayers = new Map(prev);
        newPlayers.delete(data.playerId);
        return newPlayers;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [
    setSocket,
    setIsConnected,
    setPlayerId,
    setPlayers,


  ]);

  const value = {
    socket,
    isConnected,
    playerId,
    players,
    emit: (event, data) => {
      if (socket) {
        socket.emit(event, data);
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};