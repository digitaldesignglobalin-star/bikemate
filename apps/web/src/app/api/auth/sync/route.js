import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { phone, email, name, firebaseUid } = await req.json();

    if (!phone && !email) {
      return NextResponse.json({ error: 'Phone or Email is required' }, { status: 400 });
    }

    // Upsert user based on phone or email
    const user = await prisma.user.upsert({
      where: phone ? { phone: phone } : { email: email },
      update: {
        lastLogin: new Date(), // If we add this field, or just update something
        updatedAt: new Date(),
      },
      create: {
        phone: phone || null,
        email: email || null,
        name: name || "Verified Rider",
        password: "", // No password for Phone Auth users
        role: "USER"
      }
    });

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
        role: user.role
      }
    });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
