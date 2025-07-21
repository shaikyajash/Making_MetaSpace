# MetaSpace - Real-time Multiplayer Virtual Space

A real-time multiplayer virtual space application where users can interact with each other through avatars, chat, and video calls. Built with React, Node.js, Socket.IO, and WebRTC.

## 🚀 Features

- **Real-time Multiplayer**: Multiple users can join the same virtual space and see each other's movements in real-time
- **Avatar System**: Control your character with keyboard or mouse controls
- **Video Chat**: WebRTC-powered video calling between users
- **Text Chat**: Real-time text messaging using data channels
- **User Authentication**: Support for custom login and Google OAuth
- **Responsive Design**: Works across different screen sizes
- **Room System**: Users can join different rooms/spaces

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Socket.IO Client** - Real-time communication
- **Kaplay** - 2D game engine for avatar movement
- **WebRTC** - Peer-to-peer video/audio communication
- **React Router** - Client-side routing
- **Axios** - HTTP requests
- **Google OAuth** - Authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **JSON Web Tokens** - Authentication
- **UUID** - Unique identifier generation

## 📁 Project Structure

```
MetaSpace/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── GameWrapper.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── screens/
│   │   │   ├── GameScreen.jsx
│   │   │   ├── Lobby.jsx
│   │   │   └── Login.jsx
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── routes/
│   │   └── test.js
│   ├── middleware/
│   ├── app.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (.env)**
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/metaspace.git
cd metaspace
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```

3. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 🎮 Usage

### Authentication
1. Sign up with email/password or use Google OAuth
2. Login to access the virtual space

### Joining a Room
1. Enter your name and room code in the lobby
2. Click "Join" to enter the virtual space

### Controls
- **Keyboard**: Use arrow keys or WASD to move your avatar
- **Mouse**: Click anywhere to move your avatar to that location
- **Chat**: Click the chat button to open/close the chat panel
- **Video**: Use the video controls to start/stop video calls

### Features in Virtual Space
- Move your avatar around the space
- See other players' avatars in real-time
- Chat with other users via text
- Start video calls with other participants

## 📡 API Endpoints

### Test Routes
- `GET /api/` - Test route
- `GET /api/test-auth` - Test JWT authentication

### Socket Events

#### Client to Server
- `PLAYER_UPDATE` - Update player position and animation
- `join-room` - Join a room for WebRTC
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate

#### Server to Client
- `INIT` - Initialize player with ID and current players
- `PLAYER_JOINED` - New player joined
- `PLAYER_UPDATED` - Player position/animation updated
- `PLAYER_LEFT` - Player disconnected
- `user-connected` - User connected to room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate

## 🔧 Configuration

### Game Configuration
The game uses Kaplay for 2D rendering with the following settings:
- Background: 368x192 pixels, scaled 8x
- Player speed: 300 pixels/second
- Diagonal movement factor: 1/√2

### WebRTC Configuration
- STUN server: `stun:stun.l.google.com:19302`
- Data channel for text chat
- Video/audio tracks for calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- WebRTC connection may fail on some networks due to firewall restrictions
- Video quality depends on network conditions
- Mobile controls are not optimized yet

## 🛠 Future Enhancements

- [ ] Mobile-responsive controls
- [ ] Voice chat without video
- [ ] Private messaging
- [ ] Avatar customization
- [ ] Multiple room themes
- [ ] Screen sharing
- [ ] File sharing
- [ ] Emoji reactions
- [ ] Admin controls

