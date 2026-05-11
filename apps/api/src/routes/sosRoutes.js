import express from 'express';
import { triggerSOS, getSOSHistory } from '../controllers/sosController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/trigger', protect, triggerSOS);
router.get('/history', protect, getSOSHistory);

export default router;
