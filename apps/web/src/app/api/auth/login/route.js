import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { phone: phoneOrEmail, password } = await req.json();

    if (!phoneOrEmail || !password) {
      return NextResponse.json({ error: 'Identifier and Password are required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { phone: phoneOrEmail }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: phoneOrEmail }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'This account has been blocked by the administrator.' }, { status: 403 });
    }

    if (!user.password) {
      return NextResponse.json({ error: 'No password set for this account. Please use OTP.' }, { status: 400 });
    }

    // Simple string comparison for now as per initial implementation
    if (user.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        subscriptionActive: user.subscriptionActive
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
