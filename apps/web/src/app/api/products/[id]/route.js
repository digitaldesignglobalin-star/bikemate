import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
