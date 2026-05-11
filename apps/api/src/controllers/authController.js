import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP, sendOTPMail } from '../services/otpService.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        role: "USER" // Default role
      }
    });
    res.status(201).json({ message: 'User created. Please login via OTP.' });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
};

// Request 6-digit OTP via Email
export const requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Rider not found' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiry: expiry }
    });

    const sent = await sendOTPMail(email, otp);
    if (!sent) throw new Error("Failed to dispatch OTP email");

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify OTP and Issue Token
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Rider not found' });

    if (!user.otpCode || user.otpCode !== otp || new Date() > user.otpExpiry) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful use
    await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpiry: null }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Backup Login (Password based for specific roles)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Force regular users to use OTP
    if (user.role === 'USER') {
      return res.status(403).json({ 
        error: 'Security Policy: Please login using OTP verification.',
        useOTP: true 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
