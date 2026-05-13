import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { type, message } = await req.json();

    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: decoded.id,
        type: type, // 'REPORT' or 'SUGGESTION'
        message: message
      }
    });

    return NextResponse.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      feedbacks
    });
  } catch (error) {
    console.error("Feedback Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
