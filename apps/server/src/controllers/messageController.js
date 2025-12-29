import messageService from '../services/messageService.js';
import conversationService from '../services/conversationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class MessageController {
  getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await messageService.getMessages(
      conversationId,
      req.user._id.toString(),
      page,
      limit
    );

    res.json({
      success: true,
      data: result,
    });
  });

  sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required',
      });
    }

    const message = await messageService.sendMessage(
      conversationId,
      req.user._id.toString(),
      receiverId,
      content
    );

    await conversationService.updateLastMessage(conversationId, message._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message,
      },
    });
  });

  markMessagesAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const count = await messageService.markMessagesAsRead(
      conversationId,
      req.user._id.toString()
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: {
        count,
      },
    });
  });
}

export default new MessageController();

