import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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

    const admin = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id.toString(),
        customer: o.user?.name || 'Guest',
        email: o.user?.email || '—',
        items: 'Order #' + o.id,
        amount: o.total,
        status: o.status.toLowerCase(),
        date: o.createdAt
      }))
    });
  } catch (error) {
    console.error("Admin Orders Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
