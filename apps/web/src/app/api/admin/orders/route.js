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

export async function PATCH(req) {
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

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id.toString(),
        customer: updatedOrder.user?.name || 'Guest',
        email: updatedOrder.user?.email || '—',
        amount: updatedOrder.total,
        status: updatedOrder.status.toLowerCase(),
        date: updatedOrder.createdAt
      }
    });
  } catch (error) {
    console.error("Admin Order Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
