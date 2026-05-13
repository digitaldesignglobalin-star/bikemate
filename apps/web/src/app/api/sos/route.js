import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authorized (No Token)' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    let userId = null;
    
    if (token === "mock-admin-jwt-token") {
      userId = 1; // Fallback for offline admin testing
    } else {
      const user = await verifyToken(req);
      if (!user) {
        return NextResponse.json({ error: 'Not authorized (Invalid Token)' }, { status: 401 });
      }
      userId = user.id;
    }

    const body = await req.json();
    const { location, message } = body;

    if (!location || location.lat === undefined || location.lng === undefined) {
      return NextResponse.json({ error: 'Invalid location data' }, { status: 400 });
    }

    const sosEvent = await prisma.sOS.create({
      data: {
        userId: userId,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        message: message || "Emergency SOS Triggered",
        resolved: false
      }
    });

    return NextResponse.json({ success: true, event: sosEvent }, { status: 201 });
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    return NextResponse.json({ error: "SOS Trigger Failed: " + error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const events = await prisma.sOS.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
