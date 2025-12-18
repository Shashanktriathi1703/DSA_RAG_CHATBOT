// routes/chat.js
import express from 'express';
import { sendMessage, getChatHistory, createNewSession, downloadChat, getChatBySession} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/message', sendMessage);
router.get('/history/:sessionId', getChatHistory);
router.post('/session', createNewSession);
router.post('/download', downloadChat);
// router.get('/history', getChatHistory);
router.get('/session/:sessionId', getChatBySession);

export default router;