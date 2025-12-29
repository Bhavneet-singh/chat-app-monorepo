import express from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/', userController.getUsers);

router.get('/:id', userController.getUserById);

export default router;

