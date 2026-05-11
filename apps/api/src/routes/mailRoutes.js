import express from 'express';
import { sendPurchaseMail } from '../controllers/mailController.js';

const router = express.Router();

router.post('/purchase', sendPurchaseMail);

export default router;
