import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { MESSAGE_STATUS } from '@chat/shared';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class MessageService {
  async sendMessage(conversationId, senderId, receiverId, content) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      status: MESSAGE_STATUS.SENT,
    });

    await message.populate('sender', 'username email');
    await message.populate('receiver', 'username email');

    logger.info(`Message sent: ${message._id} in conversation ${conversationId}`);

    return message;
  }

  async getMessages(conversationId, userId, page = 1, limit = 20) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversation: conversationId });

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markMessagesAsRead(conversationId, userId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const result = await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        status: { $ne: MESSAGE_STATUS.READ },
      },
      {
        status: MESSAGE_STATUS.READ,
        readAt: new Date(),
      }
    );

    logger.info(`Marked ${result.modifiedCount} messages as read in conversation ${conversationId}`);

    return result.modifiedCount;
  }

  async updateMessageStatus(messageId, status) {
    const update = { status };
    
    if (status === MESSAGE_STATUS.READ) {
      update.readAt = new Date();
    }

    const message = await Message.findByIdAndUpdate(messageId, update, { new: true })
      .populate('sender', 'username email')
      .populate('receiver', 'username email');

    return message;
  }
}

export default new MessageService();

