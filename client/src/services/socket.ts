// client/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // When using Vite proxy or in production on Render, connecting to window.location.origin
    // or relative path handles everything cleanly without CORS or hardcoded ports.
    const url = window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;
    socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }
  return socket;
}
