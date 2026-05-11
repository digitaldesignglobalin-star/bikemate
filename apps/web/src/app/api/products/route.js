import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, category, price, mrp, stock, images, variants, description } = body;
    
    // Generate a unique slug based on name and timestamp
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: category || "OTHER",
        price,
        mrp,
        stock,
        images: images || [],
        variants: variants || [],
        description
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
