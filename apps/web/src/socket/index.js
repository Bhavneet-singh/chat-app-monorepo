import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@chat/shared';
import { getAuthToken } from '../services/api.js';

let socket = null;

export const initializeSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on(SOCKET_EVENTS.ERROR, (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

