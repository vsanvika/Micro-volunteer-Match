import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (userId) => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket connected]:', socket.id);
      if (userId) {
        socket.emit('user_online', userId);
      }
    });
  } else if (userId) {
    socket.emit('user_online', userId);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
