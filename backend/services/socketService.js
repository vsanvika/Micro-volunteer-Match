const socketIO = require('socket.io');

let io;
const userSocketMap = new Map(); // userId -> socketId

const initSocket = (server, allowedOrigins = ['http://localhost:3000']) => {
  io = socketIO(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
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

    socket.on('call_offer', ({ taskId, recipientId, offer, mode, caller, callerId, callMessageId }) => {
      const payload = { offer, mode, caller, callerId, recipientId, callMessageId };
      const recipientSocketId = userSocketMap.get(recipientId?.toString());
      if (recipientSocketId && recipientSocketId !== socket.id) {
        io.to(recipientSocketId).emit('call_offer', payload);
      } else {
        socket.to(`chat_${taskId}`).emit('call_offer', payload);
      }
    });

    socket.on('call_answer', ({ taskId, answer, callMessageId, callerId }) => {
      const payload = { answer, callMessageId };
      const callerSocketId = userSocketMap.get(callerId?.toString());
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_answer', payload);
      } else {
        socket.to(`chat_${taskId}`).emit('call_answer', payload);
      }
    });

    socket.on('call_decline', ({ taskId, callMessageId, callerId }) => {
      const payload = { callMessageId };
      const callerSocketId = userSocketMap.get(callerId?.toString());
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_decline', payload);
      } else {
        socket.to(`chat_${taskId}`).emit('call_decline', payload);
      }
    });

    socket.on('call_ice_candidate', ({ taskId, candidate }) => {
      socket.to(`chat_${taskId}`).emit('call_ice_candidate', { candidate });
    });

    socket.on('call_end', ({ taskId }) => {
      socket.to(`chat_${taskId}`).emit('call_end');
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

const sendCallSignalToUser = (userId, event, payload) => {
  if (io && userId) {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) io.to(socketId).emit(event, payload);
  }
};

const sendChatMessageToRoom = (taskId, messageData) => {
  if (io && taskId) {
    io.to(`chat_${taskId}`).emit('new_message', messageData);
  }
};

const sendChatClearedToRoom = (taskId, clearedBy) => {
  if (io && taskId) {
    io.to(`chat_${taskId}`).emit('chat_cleared', { clearedBy: clearedBy?.toString() });
  }
};

const sendWorkspaceUpdateToRoom = (taskId, workspace) => {
  if (io && taskId) io.to(`chat_${taskId}`).emit('workspace_updated', workspace);
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  sendCallSignalToUser,
  sendChatMessageToRoom,
  sendChatClearedToRoom,
  sendWorkspaceUpdateToRoom,
};
