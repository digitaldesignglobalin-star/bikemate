import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req) {
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

    const data = await req.json();

    // Prevent updating restricted fields
    const allowedFields = ['name', 'email', 'phone', 'city', 'address', 'bloodGroup', 'guardianName', 'allergies', 'medicalNotes', 'bikeModel', 'bikeRegNo', 'bikeYear', 'avatarUrl', 'password'];
    
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        let val = data[key];
        // Type conversion for Prisma
        if (key === 'bikeYear' && val !== "") {
          val = parseInt(val);
        }
        updateData[key] = val;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        city: user.city,
        address: user.address,
        guardianName: user.guardianName,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        medicalNotes: user.medicalNotes,
        bikeModel: user.bikeModel,
        bikeRegNo: user.bikeRegNo,
        bikeYear: user.bikeYear,
        avatarUrl: user.avatarUrl,
        subscriptionActive: user.subscriptionActive
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
