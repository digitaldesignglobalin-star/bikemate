import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { phone, email, name, firebaseUid } = await req.json();

    if (!phone && !email) {
      return NextResponse.json({ error: 'Phone or Email is required' }, { status: 400 });
    }

    // Check if user already exists to check block status
    let existingUser = await prisma.user.findUnique({
      where: phone ? { phone: phone } : { email: email }
    });

    if (existingUser && existingUser.isBlocked) {
      return NextResponse.json({ error: 'This account has been blocked by the administrator.' }, { status: 403 });
    }

    const isNewUser = !existingUser;

    // Upsert user based on phone or email
    const user = await prisma.user.upsert({
      where: phone ? { phone: phone } : { email: email },
      update: {
        updatedAt: new Date(),
      },
      create: {
        phone: phone || null,
        email: email || null,
        name: name || "Verified Rider",
        password: "", // No password for Phone Auth users initially
        role: "USER"
      }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Send welcome email for new users (non-blocking)
    if (isNewUser && user.email) {
      sendWelcomeEmail(user).catch(err => {
        console.warn("[Auth Sync] Welcome email failed:", err.message);
      });
    }

    return NextResponse.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        subscriptionActive: user.subscriptionActive,
        password: user.password ? true : false, // Tell frontend if password exists
      }
    });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
