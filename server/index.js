// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// Socket.io connection logic
io.on('connection', (socket) => {
  // Broadcast real-time online count immediately on new connection
  const broadcastCurrentCount = () => {
    const count = Math.max(1, io.engine.clientsCount || io.sockets.sockets.size || gameManager.users.size || 1);
    io.emit('online_count', {
      count,
      activeRooms: gameManager.rooms.size
    });
  };

  broadcastCurrentCount();

  socket.on('get_online_count', () => {
    const count = Math.max(1, io.engine.clientsCount || io.sockets.sockets.size || gameManager.users.size || 1);
    socket.emit('online_count', {
      count,
      activeRooms: gameManager.rooms.size
    });
  });

  // Register user profile
  socket.on('register_user', (userData) => {
    gameManager.registerUser(socket.id, userData);
    broadcastCurrentCount();
  });

  socket.on('update_profile', (userData) => {
    gameManager.updateUserProfile(socket.id, userData);
  });

  // Check room status
  socket.on('check_room', ({ roomId }, callback) => {
    const info = gameManager.getRoomInfo(roomId);
    if (callback) callback(info);
  });

  // Matchmaking
  socket.on('find_match', (payload) => {
    const gameId = typeof payload === 'string' ? payload : payload?.gameId;
    const userData = payload?.user;
    gameManager.enqueueMatchmaking(socket, gameId, userData);
  });

  socket.on('cancel_matchmaking', (payload) => {
    const gameId = typeof payload === 'string' ? payload : payload?.gameId;
    gameManager.dequeueMatchmaking(socket, gameId);
  });

  // Private Rooms
  socket.on('create_room', ({ gameId, maxPlayers }) => {
    gameManager.createPrivateRoom(socket, gameId, maxPlayers);
  });

  socket.on('join_room', ({ roomId, gameId }) => {
    gameManager.joinPrivateRoom(socket, roomId, gameId);
  });

  socket.on('add_bot_to_room', ({ roomId }) => {
    gameManager.addBotToRoom(socket, roomId);
  });

  socket.on('start_room_game', ({ roomId }) => {
    gameManager.startRoomGame(socket, roomId);
  });

  // Gameplay
  socket.on('make_move', (payload) => {
    gameManager.handleMove(socket, payload);
  });

  socket.on('game_action', (payload) => {
    if (payload?.roomId) {
      socket.to(payload.roomId).emit('game_action', payload);
    }
  });

  // 30s Move Timeout
  socket.on('player_timeout', (payload) => {
    gameManager.handleTimeoutLoss(socket, payload);
  });

  socket.on('game_over', (payload) => {
    gameManager.handleGameOver(socket, payload);
  });

  socket.on('request_rematch', (payload) => {
    gameManager.handleRematchRequest(socket, payload);
  });

  socket.on('send_chat', (payload) => {
    gameManager.handleChat(socket, payload);
  });

  socket.on('leave_room', ({ roomId }) => {
    gameManager.leaveRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    gameManager.removeUser(socket.id);
    broadcastCurrentCount();
  });
});

// API Endpoints
app.get('/api/health', (req, res) => {
  const count = Math.max(1, io.engine.clientsCount || io.sockets.sockets.size || gameManager.users.size || 1);
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeUsers: count,
    activeRooms: gameManager.rooms.size
  });
});

app.get('/api/room/:roomId', (req, res) => {
  const info = gameManager.getRoomInfo(req.params.roomId);
  if (!info) {
    return res.status(404).json({ error: 'Room not found or expired' });
  }
  res.json(info);
});

// Serve frontend in production or if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send('Gamzyard API server is running on port ' + PORT);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gamzyard Server] Running on http://0.0.0.0:${PORT}`);
});
