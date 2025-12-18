import express from 'express';
import { sendDiscussionEmail } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/discuss', protect, sendDiscussionEmail);

export default router;
