// server/gameManager.js

class GameManager {
  constructor(io) {
    this.io = io;
    // Map of roomId -> room object
    this.rooms = new Map();
    // Map of gameId -> array of { socketId, user } waiting for an opponent
    this.matchmakingQueues = new Map();
    // Map of socketId -> user profile
    this.users = new Map();

    const games = [
      'tic-tac-toe', 'connect-four', 'chess', 'checkers', 'battleship',
      'othello', 'dots-and-boxes', 'gomoku', 'memory-match', 'mancala',
      'cyber-trivia', 'word-clash', 'rps-strike',
      'hand-cricket', 'rpsls', 'nim', 'matchstick-puzzle',
      'coin-toss', 'odd-even', 'higher-lower', 'guess-number',
      'pallanguzhi', 'chowka-bara', 'pachisi', 'snakes-and-ladders', 'ludo', 'carrom',
      'kabaddi', 'cricket-quiz', 'antakshari', 'name-place-animal-thing',
      'truth-or-dare', 'never-have-i-ever', 'who-knows-me-best', 'most-likely-to',
      'two-truths-and-a-lie', 'would-you-rather', 'rapid-fire', 'dumb-charades',
      'guess-the-movie', 'guess-the-song', 'guess-the-word', 'imposter-word',
      'mafia', 'spyfall',
      'word-chain', 'wordle', 'hangman', 'word-builder', 'anagrams', 'unscramble',
      'last-letter', 'alphabet-categories', 'forbidden-word', 'rhyme-battle',
      'sentence-builder', 'emoji-movie-guess',
      'sudoku', 'minesweeper', 'simon-says', 'mastermind', 'bulls-and-cows',
      'nonogram', 'lights-out', 'math-battle', 'logic-grid', 'pattern-recognition',
      'daily-riddle'
    ];
    games.forEach(g => this.matchmakingQueues.set(g, []));
  }

  registerUser(socketId, user) {
    this.users.set(socketId, {
      id: socketId,
      name: user?.name || `Player_${socketId.slice(0, 4)}`,
      avatar: user?.avatar || 'fox',
      isGuest: user?.isGuest ?? true
    });
    this.broadcastOnlineCount();
  }

  updateUserProfile(socketId, user) {
    if (this.users.has(socketId)) {
      const existing = this.users.get(socketId);
      this.users.set(socketId, {
        ...existing,
        name: user.name || existing.name,
        avatar: user.avatar || existing.avatar,
      });
    }
  }

  getRoomInfo(roomId) {
    if (!roomId) return null;
    const normalized = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalized);
    if (!room) return null;
    return {
      roomId: room.id,
      gameId: room.gameId,
      playersCount: room.players.length,
      isFull: room.players.length >= 2,
      hostName: room.players[0] ? room.players[0].name : 'Host',
      hostAvatar: room.players[0] ? room.players[0].avatar : 'fox'
    };
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    this.users.delete(socketId);

    // Remove from all matchmaking queues
    for (const [gameId, queue] of this.matchmakingQueues.entries()) {
      this.matchmakingQueues.set(
        gameId,
        queue.filter(p => p.socketId !== socketId)
      );
    }

    // Handle any rooms where user is active
    for (const [roomId, room] of this.rooms.entries()) {
      this.handlePlayerExit(socketId, roomId, 'disconnect');
    }
    this.broadcastOnlineCount();
  }

  handlePlayerExit(socketId, roomId, reason = 'exit') {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return;

    const leavingPlayer = room.players[playerIndex];
    const leavingPlayerName = leavingPlayer.name || 'Opponent';

    const otherHumanPlayers = room.players.filter(p => !p.isBot && p.socketId !== socketId);
    const hasBots = room.players.some(p => p.isBot);
    const isMultiOrHasBots = room.players.length > 2 || hasBots;

    if (otherHumanPlayers.length > 0 && isMultiOrHasBots) {
      // Don't kill the room! AI Bot takes over their slot so remaining humans can finish
      leavingPlayer.isBot = true;
      leavingPlayer.name = `${leavingPlayerName} (Bot)`;
      leavingPlayer.socketId = `bot_${Math.random().toString(36).slice(2, 6)}`;
      leavingPlayer.avatar = 'robot';

      if (leavingPlayer.isHost) {
        leavingPlayer.isHost = false;
        otherHumanPlayers[0].isHost = true;
      }

      this.io.to(roomId).emit('player_replaced_by_bot', {
        roomId,
        leavingSocketId: socketId,
        leavingName: leavingPlayerName,
        replacedRole: leavingPlayer.role,
        replacedPlayer: leavingPlayer,
        allPlayers: room.players,
        message: `${leavingPlayerName} left the game. An AI Bot has taken over their pawns!`
      });
      console.log(`[Room ${roomId}] Player ${leavingPlayerName} replaced by AI Bot. Game continues.`);
    } else {
      if (otherHumanPlayers.length > 0) {
        const remainingPlayer = otherHumanPlayers[0];
        this.io.to(remainingPlayer.socketId).emit('opponent_left', {
          message: `${leavingPlayerName} left the game.`,
          leavingName: leavingPlayerName,
          winner: remainingPlayer.socketId,
          reason
        });
      }
      this.rooms.delete(roomId);
    }
  }

  broadcastOnlineCount() {
    const count = Math.max(1, this.io.engine.clientsCount || this.io.sockets.sockets.size || this.users.size || 1);
    this.io.emit('online_count', {
      count,
      activeRooms: this.rooms.size
    });
  }

  // --- MATCHMAKING ---
  enqueueMatchmaking(socket, gameId, userData) {
    let user = userData || this.users.get(socket.id);
    if (!user) {
      user = {
        id: socket.id,
        name: `Player_${socket.id.slice(0, 4)}`,
        avatar: 'fox',
        isGuest: true
      };
      this.users.set(socket.id, user);
    }

    if (!this.matchmakingQueues.has(gameId)) {
      this.matchmakingQueues.set(gameId, []);
    }

    let queue = this.matchmakingQueues.get(gameId);

    // Filter out this socket and any disconnected sockets
    queue = queue.filter(item => {
      if (item.socketId === socket.id) return false;
      const s = this.io.sockets.sockets.get(item.socketId);
      return s && s.connected;
    });

    if (queue.length > 0) {
      // Opponent found!
      const opponent = queue.shift();
      this.matchmakingQueues.set(gameId, queue);

      const roomId = 'M_' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const newRoom = {
        id: roomId,
        gameId,
        isPublicMatch: true,
        players: [
          { socketId: opponent.socketId, ...opponent.user, symbol: 'X', color: 'white', role: 'player1' },
          { socketId: socket.id, ...user, symbol: 'O', color: 'black', role: 'player2' }
        ],
        gameState: null,
        currentTurn: opponent.socketId,
        scores: { [opponent.socketId]: 0, [socket.id]: 0 },
        rematchVotes: new Set()
      };

      this.rooms.set(roomId, newRoom);

      const opSocket = this.io.sockets.sockets.get(opponent.socketId);
      if (opSocket) {
        opSocket.join(roomId);
      }
      socket.join(roomId);

      console.log(`[Matchmaking Success] Matched ${opponent.socketId} vs ${socket.id} in room ${roomId} for ${gameId}`);

      // Notify player 1
      this.io.to(opponent.socketId).emit('match_found', {
        roomId,
        gameId,
        you: newRoom.players[0],
        opponent: newRoom.players[1],
        yourRole: 'player1',
        isYourTurn: true
      });

      // Notify player 2
      this.io.to(socket.id).emit('match_found', {
        roomId,
        gameId,
        you: newRoom.players[1],
        opponent: newRoom.players[0],
        yourRole: 'player2',
        isYourTurn: false
      });

      this.broadcastOnlineCount();
    } else {
      queue.push({ socketId: socket.id, user });
      this.matchmakingQueues.set(gameId, queue);
      console.log(`[Matchmaking Queue] Socket ${socket.id} waiting for ${gameId}. Queue size: ${queue.length}`);
      socket.emit('matchmaking_status', { status: 'waiting', gameId });
    }
  }

  dequeueMatchmaking(socket, gameId) {
    if (this.matchmakingQueues.has(gameId)) {
      const queue = this.matchmakingQueues.get(gameId);
      const filtered = queue.filter(item => item.socketId !== socket.id);
      this.matchmakingQueues.set(gameId, filtered);
      socket.emit('matchmaking_status', { status: 'cancelled', gameId });
    }
  }

  // --- PRIVATE ROOMS ---
  createPrivateRoom(socket, gameId, maxPlayers = 2) {
    let user = this.users.get(socket.id);
    if (!user) {
      user = { id: socket.id, name: `Player_${socket.id.slice(0, 4)}`, avatar: 'fox', isGuest: true };
      this.users.set(socket.id, user);
    }

    const multiCapacityGames = [
      'ludo', 'snakes-and-ladders', 'chowka-bara', 'pachisi', 'carrom', 'antakshari', 'name-place-animal-thing',
      'truth-or-dare', 'never-have-i-ever', 'who-knows-me-best', 'most-likely-to',
      'two-truths-and-a-lie', 'would-you-rather', 'rapid-fire', 'dumb-charades',
      'guess-the-movie', 'guess-the-song', 'guess-the-word', 'imposter-word',
      'mafia', 'spyfall',
      'word-chain', 'wordle', 'hangman', 'word-builder', 'anagrams', 'unscramble',
      'last-letter', 'alphabet-categories', 'forbidden-word', 'rhyme-battle',
      'sentence-builder', 'emoji-movie-guess',
      'memory-match', 'math-battle'
    ];
    const defaultCapacity = multiCapacityGames.includes(gameId) ? 4 : 2;
    const capacity = Math.max(2, Math.min(8, maxPlayers || defaultCapacity));
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = {
      id: roomId,
      gameId,
      maxPlayers: capacity,
      isPublicMatch: false,
      players: [
        { socketId: socket.id, ...user, symbol: 'P1', color: 'red', role: 'player1', isHost: true, isBot: false }
      ],
      gameState: null,
      currentTurn: socket.id,
      scores: { [socket.id]: 0 },
      rematchVotes: new Set()
    };

    this.rooms.set(roomId, room);
    socket.join(roomId);

    socket.emit('room_created', {
      roomId,
      gameId,
      room
    });
    this.broadcastOnlineCount();
  }

  joinPrivateRoom(socket, roomId, requestedGameId) {
    let user = this.users.get(socket.id);
    if (!user) {
      user = { id: socket.id, name: `Player_${socket.id.slice(0, 4)}`, avatar: 'fox', isGuest: true };
      this.users.set(socket.id, user);
    }

    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    let room = this.rooms.get(normalizedRoomId);

    // If room is not registered yet
    if (!room) {
      socket.emit('join_error', {
        message: `Room "${normalizedRoomId}" was not found or has expired. Make sure host has room open.`
      });
      return;
    }

    const maxCap = room.maxPlayers || 2;
    if (room.players.length >= maxCap) {
      const existingPlayer = room.players.find(p => p.socketId === socket.id);
      if (!existingPlayer) {
        socket.emit('join_error', { message: `This room is already full (${room.players.length}/${maxCap} players).` });
        return;
      }
    } else {
      const existingPlayer = room.players.find(p => p.socketId === socket.id);
      if (!existingPlayer) {
        const roleIdx = room.players.length + 1;
        const colors = ['red', 'green', 'yellow', 'blue'];
        room.players.push({
          socketId: socket.id,
          ...user,
          symbol: `P${roleIdx}`,
          color: colors[roleIdx - 1] || 'white',
          role: `player${roleIdx}`,
          isHost: false,
          isBot: false
        });
        room.scores[socket.id] = 0;
      }
    }

    socket.join(normalizedRoomId);

    // Broadcast room update to all in room
    this.io.to(normalizedRoomId).emit('room_update', { room });

    // If room is full, start game automatically or allow host to start
    if (room.players.length >= maxCap) {
      this.startRoomGame(socket, normalizedRoomId, true);
    }

    this.broadcastOnlineCount();
  }

  addBotToRoom(socket, roomId) {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);
    if (!room) return;

    const maxCap = room.maxPlayers || 4;
    if (room.players.length >= maxCap) return;

    const roleIdx = room.players.length + 1;
    const colors = ['red', 'green', 'yellow', 'blue'];
    const bot = {
      socketId: `bot_${Math.random().toString(36).slice(2, 6)}`,
      id: `bot_${roleIdx}`,
      name: `AI Bot ${roleIdx}`,
      avatar: 'robot',
      symbol: `P${roleIdx}`,
      color: colors[roleIdx - 1] || 'white',
      role: `player${roleIdx}`,
      isHost: false,
      isBot: true
    };

    room.players.push(bot);
    this.io.to(normalizedRoomId).emit('room_update', { room });

    if (room.players.length >= maxCap) {
      this.startRoomGame(socket, normalizedRoomId, true);
    }
  }

  startRoomGame(socket, roomId, isAuto = false) {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);
    if (!room || room.players.length < 2) return;

    room.players.forEach((p, idx) => {
      if (!p.isBot) {
        const opponent = room.players.find(other => other.socketId !== p.socketId) || room.players[1];
        this.io.to(p.socketId).emit('room_joined', {
          roomId: normalizedRoomId,
          gameId: room.gameId,
          you: p,
          opponent,
          allPlayers: room.players,
          playerCount: room.players.length,
          yourRole: p.role,
          isYourTurn: idx === 0
        });
      }
    });
    this.broadcastOnlineCount();
  }

  handleMove(socket, { roomId, move, nextTurnState }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = nextTurnState;
    socket.to(roomId).emit('opponent_move', {
      move,
      nextTurnState,
      senderId: socket.id
    });
  }

  handleTimeoutLoss(socket, { roomId, timedOutPlayerId }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const winnerPlayer = room.players.find(p => p.socketId !== timedOutPlayerId);
    if (winnerPlayer) {
      if (room.scores[winnerPlayer.socketId] !== undefined) {
        room.scores[winnerPlayer.socketId] += 1;
      }
      this.io.to(roomId).emit('player_timed_out', {
        timedOutPlayerId,
        winner: winnerPlayer.socketId,
        winnerName: winnerPlayer.name,
        message: `Time expired! 30-second turn limit reached.`
      });
    }
  }

  handleGameOver(socket, { roomId, winner, isDraw }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (winner && room.scores[winner] !== undefined) {
      room.scores[winner] += 1;
    }

    this.io.to(roomId).emit('game_ended', {
      winner,
      isDraw,
      scores: room.scores
    });
  }

  handleRematchRequest(socket, { roomId }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.rematchVotes.add(socket.id);

    if (room.rematchVotes.size >= 2) {
      room.rematchVotes.clear();
      room.gameState = null;
      const p1 = room.players[0];
      const p2 = room.players[1];
      const starterId = (room.currentTurn === p1.socketId) ? p2.socketId : p1.socketId;
      room.currentTurn = starterId;

      this.io.to(roomId).emit('rematch_started', {
        starterId,
        scores: room.scores
      });
    } else {
      const user = this.users.get(socket.id) || room.players.find(p => p.socketId === socket.id);
      socket.to(roomId).emit('rematch_offered', {
        from: socket.id,
        fromName: user?.name || 'Opponent'
      });
    }
  }

  handleChat(socket, { roomId, text }) {
    const user = this.users.get(socket.id);
    if (!user || !text.trim()) return;

    this.io.to(roomId).emit('chat_message', {
      id: Math.random().toString(36).substring(2, 9),
      senderId: socket.id,
      senderName: user.name,
      avatar: user.avatar,
      text: text.slice(0, 200),
      timestamp: Date.now()
    });
  }

  leaveRoom(socket, roomId) {
    this.handlePlayerExit(socket.id, roomId, 'exit');
    socket.leave(roomId);
    this.broadcastOnlineCount();
  }
}

module.exports = GameManager;
