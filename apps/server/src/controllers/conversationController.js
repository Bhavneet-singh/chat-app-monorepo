import conversationService from '../services/conversationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class ConversationController {
  getConversations = asyncHandler(async (req, res) => {
    const conversations = await conversationService.getUserConversations(req.user._id.toString());

    res.json({
      success: true,
      data: {
        conversations,
      },
    });
  });

  getConversation = asyncHandler(async (req, res) => {
    const conversation = await conversationService.getConversationById(
      req.params.id,
      req.user._id.toString()
    );

    res.json({
      success: true,
      data: {
        conversation,
      },
    });
  });

  createConversation = asyncHandler(async (req, res) => {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required',
      });
    }

    const conversation = await conversationService.getOrCreateConversation(
      req.user._id.toString(),
      participantId
    );

    res.status(201).json({
      success: true,
      data: {
        conversation,
      },
    });
  });
}

export default new ConversationController();

