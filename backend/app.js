const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const server = app.listen(8080, () => {
  console.log('Server running on port 8080');
});

const wss = new WebSocket.Server({ server });
const players = new Map();

wss.on('connection', (ws) => {
  const playerId = uuidv4();
  
  players.set(playerId, {
    id: playerId,
    position: { x: 0, y: 0 },
    animation: 'down-idle'
  });

  ws.send(JSON.stringify({
    type: 'INIT',
    playerId,
    players: Array.from(players.values())
  }));

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'PLAYER_JOINED',
        player: players.get(playerId)
      }));
    }
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'PLAYER_UPDATE') {
      players.set(playerId, {
        ...players.get(playerId),
        position: data.position,
        animation: data.animation
      });
      
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'PLAYER_UPDATED',
            playerId,
            position: data.position,
            animation: data.animation
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    players.delete(playerId);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'PLAYER_LEFT',
          playerId
        }));
      }
    });
  });
});