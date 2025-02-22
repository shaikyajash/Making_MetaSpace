// backend/app.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const players = new Map();

io.on('connection', (socket) => {
  console.log('a client connected');
  const playerId = uuidv4();
  
  // Initialize player
  players.set(playerId, {
    id: playerId,
    position: { x: 0, y: 0 },
    animation: 'down-idle'
  });

  // Send initial state to new player
  socket.emit('INIT', {
    playerId,
    players: Array.from(players.values())
  });

  // Broadcast new player to others
  socket.broadcast.emit('PLAYER_JOINED', {
    player: players.get(playerId)
  });

  // Handle player updates
  socket.on('PLAYER_UPDATE', (data) => {
    players.set(playerId, {
      ...players.get(playerId),
      position: data.position,
      animation: data.animation
    });
    
    socket.broadcast.emit('PLAYER_UPDATED', {
      playerId,
      position: data.position,
      animation: data.animation
    });
  });

  // Handle room joining for WebRTC
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // WebRTC signaling
  socket.on("offer", (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    players.delete(playerId);
    io.emit('PLAYER_LEFT', { playerId });
    console.log('a client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});