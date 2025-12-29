import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class ConversationService {
  async getOrCreateConversation(userId1, userId2) {
    if (userId1 === userId2) {
      throw new AppError('Cannot create conversation with yourself', 400);
    }

    let conversation = await Conversation.findByParticipants(userId1, userId2);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
      });
      
      await conversation.populate('participants', 'username email isOnline lastSeen');
      
      logger.info(`Conversation created: ${conversation._id} between ${userId1} and ${userId2}`);
    }

    return conversation;
  }

  async getUserConversations(userId) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean();

    return conversations;
  }

  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate('participants', 'username email isOnline lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return conversation;
  }

  async updateLastMessage(conversationId, messageId) {
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
      lastMessageAt: new Date(),
    });
  }
}

export default new ConversationService();

