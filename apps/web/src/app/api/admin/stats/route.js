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

    // Run ALL queries in parallel instead of sequentially — massive speedup
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [
      memberCount,
      newToday,
      orders,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.order.findMany({
        select: { status: true, total: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } }
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true
        }
      })
    ]);

    const successOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED' || o.status === 'CONFIRMED');
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const revenue = successOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        members: memberCount,
        newToday: newToday,
        totalOrders: orders.length,
        successOrders: successOrders.length,
        pendingOrders: pendingOrders.length,
        revenue: revenue,
        freeStickers: 0,
        paidStickers: 0
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id.toString(),
        customer: o.user?.name || 'Guest',
        items: 'Order #' + o.id,
        amount: o.total,
        status: o.status.toLowerCase(),
        date: o.createdAt
      })),
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name || 'Unnamed',
        phone: u.phone || '—',
        role: u.role,
        date: u.createdAt
      }))
    });
  } catch (error) {
    console.error("Admin Stats Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
