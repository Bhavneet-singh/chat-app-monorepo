import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/auth.js';
import userService from '../services/userService.js';
import conversationService from '../services/conversationService.js';
import messageService from '../services/messageService.js';
import { SOCKET_EVENTS, MESSAGE_STATUS } from '@chat/shared';
import logger from '../config/logger.js';

const activeUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    
    logger.info(`Socket connected: ${socket.id} for user: ${userId}`);

    const existingSocket = activeUsers.get(userId);
    if (existingSocket && existingSocket !== socket.id) {
      logger.info(`Disconnecting duplicate socket for user: ${userId}`);
      io.to(existingSocket).emit(SOCKET_EVENTS.ERROR, { message: 'New connection established' });
      io.sockets.sockets.get(existingSocket)?.disconnect();
    }

    activeUsers.set(userId, socket.id);
    await userService.updateOnlineStatus(userId, true);

    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });

    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await conversationService.getConversationById(conversationId, userId);

        if (!conversation) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Conversation not found' });
          return;
        }

        const roomName = `conversation:${conversationId}`;
        socket.join(roomName);

        logger.info(`User ${userId} joined conversation ${conversationId}`);

        await messageService.markMessagesAsRead(conversationId, userId);

        io.to(roomName).emit(SOCKET_EVENTS.MESSAGES_READ, {
          conversationId,
          userId,
        });
      } catch (error) {
        logger.error('Error joining conversation:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join conversation' });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (data) => {
      const { conversationId } = data;
      const roomName = `conversation:${conversationId}`;
      socket.leave(roomName);
      logger.info(`User ${userId} left conversation ${conversationId}`);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, async (data) => {
      try {
        const { conversationId, receiverId, content } = data;

        if (!content || !content.trim()) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Message content is required' });
          return;
        }

        const message = await messageService.sendMessage(
          conversationId,
          userId,
          receiverId,
          content
        );

        await conversationService.updateLastMessage(conversationId, message._id);

        const roomName = `conversation:${conversationId}`;

        socket.emit(SOCKET_EVENTS.MESSAGE_SENT, { message });

        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, { message });
          io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
            messageId: message._id,
            conversationId,
          });

          const updatedMessage = await messageService.updateMessageStatus(
            message._id,
            MESSAGE_STATUS.DELIVERED
          );
          io.to(receiverSocketId).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
            message: updatedMessage,
          });
        }

        io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_SENT, { message });
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to send message' });
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data) => {
      try {
        const { messageId, conversationId } = data;

        const message = await messageService.updateMessageStatus(
          messageId,
          MESSAGE_STATUS.READ
        );

        const roomName = `conversation:${conversationId}`;
        io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_READ, { message });
      } catch (error) {
        logger.error('Error marking message as read:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to mark message as read' });
      }
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id} for user: ${userId}`);

      if (activeUsers.get(userId) === socket.id) {
        activeUsers.delete(userId);
        await userService.updateOnlineStatus(userId, false);

        socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
      }
    });
  });

  return io;
};

