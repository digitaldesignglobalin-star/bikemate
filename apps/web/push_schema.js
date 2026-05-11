// Run this with: node push_schema.js
// It connects directly to Supabase and creates all tables

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔗 Connecting to Supabase...');

  // Test connection
  const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
  console.log('✅ Connected:', result[0]);

  // Check existing tables
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('\n📋 Existing tables:', tables.map(t => t.table_name));

  // Create all tables
  console.log('\n🏗️  Creating tables...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL PRIMARY KEY,
      "email" TEXT UNIQUE,
      "name" TEXT,
      "password" TEXT,
      "phone" TEXT UNIQUE,
      "city" TEXT,
      "address" TEXT,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "otpCode" TEXT,
      "otpExpiry" TIMESTAMPTZ,
      "bloodGroup" TEXT,
      "avatarUrl" TEXT,
      "avatarPath" TEXT,
      "guardianName" TEXT,
      "allergies" TEXT,
      "medicalNotes" TEXT,
      "bikeModel" TEXT,
      "bikeRegNo" TEXT,
      "bikeYear" INT,
      "isVolunteer" BOOLEAN NOT NULL DEFAULT false,
      "volunteerLat" DOUBLE PRECISION,
      "volunteerLng" DOUBLE PRECISION,
      "volunteerUpdatedAt" TIMESTAMPTZ,
      "isLive" BOOLEAN NOT NULL DEFAULT false,
      "liveLat" DOUBLE PRECISION,
      "liveLng" DOUBLE PRECISION,
      "liveUpdatedAt" TIMESTAMPTZ,
      "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
      "subscriptionPlan" TEXT DEFAULT 'none',
      "subscriptionDays" INT NOT NULL DEFAULT 0,
      "subscriptionStart" TIMESTAMPTZ,
      "subscriptionEnd" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ User table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "category" TEXT NOT NULL DEFAULT 'OTHER',
      "tags" TEXT,
      "price" DOUBLE PRECISION NOT NULL,
      "mrp" DOUBLE PRECISION,
      "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
      "stock" INT NOT NULL DEFAULT 0,
      "trackStock" BOOLEAN NOT NULL DEFAULT true,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "isFeatured" BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INT NOT NULL DEFAULT 0,
      "images" JSONB NOT NULL DEFAULT '[]',
      "variants" JSONB NOT NULL DEFAULT '[]',
      "createdBy" INT REFERENCES "User"(id),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Product table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" SERIAL PRIMARY KEY,
      "userId" INT NOT NULL REFERENCES "User"(id),
      "items" JSONB NOT NULL,
      "giftWrap" BOOLEAN NOT NULL DEFAULT false,
      "giftMessage" TEXT,
      "subtotal" DOUBLE PRECISION NOT NULL,
      "total" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "address" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Order table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" SERIAL PRIMARY KEY,
      "userId" INT NOT NULL REFERENCES "User"(id),
      "orderId" INT REFERENCES "Order"(id),
      "razorpayOrderId" TEXT NOT NULL UNIQUE,
      "razorpayPaymentId" TEXT,
      "razorpaySignature" TEXT,
      "amount" INT NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'INR',
      "purpose" TEXT NOT NULL DEFAULT 'STORE_ORDER',
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'CREATED',
      "rawPayload" JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Payment table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Ride" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "creatorId" INT NOT NULL REFERENCES "User"(id),
      "startLocation" TEXT NOT NULL,
      "endLocation" TEXT NOT NULL,
      "date" TIMESTAMPTZ NOT NULL,
      "time" TEXT NOT NULL,
      "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "description" TEXT,
      "maxParticipants" INT NOT NULL DEFAULT 50,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Ride table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_JoinedRides" (
      "A" INT NOT NULL REFERENCES "Ride"(id) ON DELETE CASCADE,
      "B" INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      UNIQUE("A","B")
    )
  `);
  console.log('✅ _JoinedRides table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Document" (
      "id" SERIAL PRIMARY KEY,
      "userId" INT NOT NULL REFERENCES "User"(id),
      "type" TEXT NOT NULL,
      "label" TEXT,
      "fileUrl" TEXT NOT NULL,
      "filePath" TEXT NOT NULL,
      "mimeType" TEXT,
      "fileSizeKB" INT,
      "issueDate" TIMESTAMPTZ,
      "expiryDate" TIMESTAMPTZ,
      "status" TEXT NOT NULL DEFAULT 'VALID',
      "documentNumber" TEXT,
      "notes" TEXT,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ Document table ready');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SOS" (
      "id" SERIAL PRIMARY KEY,
      "userId" INT NOT NULL REFERENCES "User"(id),
      "lat" DOUBLE PRECISION NOT NULL,
      "lng" DOUBLE PRECISION NOT NULL,
      "message" TEXT NOT NULL DEFAULT 'Emergency SOS triggered',
      "resolved" BOOLEAN NOT NULL DEFAULT false,
      "resolvedAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ SOS table ready');

  // Final check
  const finalTables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('\n🎉 All tables in database:', finalTables.map(t => t.table_name));
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
