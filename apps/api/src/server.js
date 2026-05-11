import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma.js';

import authRoutes from './routes/authRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import liveRoutes from './routes/liveRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
app.get('/', (req, res) => res.send('<h1>🏍️ Bikemate API is Running Successfully!</h1><p>Frontend is at <a href="http://localhost:3000">localhost:3000</a></p>'));
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', stack: 'express-prisma-mysql' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
