import express from 'express';
import conversationController from '../controllers/conversationController.js';
import messageController from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter, messageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/', conversationController.getConversations);

router.post('/', conversationController.createConversation);

router.get('/:id', conversationController.getConversation);

router.get('/:conversationId/messages', messageController.getMessages);

router.post('/:conversationId/messages', messageLimiter, messageController.sendMessage);

router.post('/:conversationId/messages/read', messageController.markMessagesAsRead);

export default router;

