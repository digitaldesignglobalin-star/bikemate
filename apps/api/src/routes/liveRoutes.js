import express from 'express';
import { updateLocation, getPublicLocation, stopLive } from '../controllers/liveController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/update', protect, updateLocation);
router.post('/stop', protect, stopLive);
router.get('/:id', getPublicLocation);

export default router;
