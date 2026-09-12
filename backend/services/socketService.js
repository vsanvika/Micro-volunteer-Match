const socketIO = require('socket.io');

let io;
const userSocketMap = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    socket.on('user_online', (userId) => {
      if (userId) {
        userSocketMap.set(userId.toString(), socket.id);
        socket.userId = userId;
        console.log(`User ${userId} bound to Socket ${socket.id}`);
        io.emit('user_status_change', { userId, status: 'online' });
      }
    });

    socket.on('join_chat', (taskId) => {
      socket.join(`chat_${taskId}`);
      console.log(`Socket ${socket.id} joined room chat_${taskId}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId.toString());
        io.emit('user_status_change', { userId: socket.userId, status: 'offline' });
      }
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendNotificationToUser = (userId, notificationData) => {
  if (io && userId) {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('notification', notificationData);
    }
  }
};

const sendChatMessageToRoom = (taskId, messageData) => {
  if (io && taskId) {
    io.to(`chat_${taskId}`).emit('new_message', messageData);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  sendChatMessageToRoom,
};
