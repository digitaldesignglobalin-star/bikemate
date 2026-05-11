import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { name: true, isLive: true, liveLat: true, liveLng: true, liveUpdatedAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    if (!user.isLive) {
      return NextResponse.json({ error: 'Rider is currently offline', name: user.name, isLive: false }, { status: 403 });
    }

    return NextResponse.json({ success: true, ...user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
