-- ============================================
-- BIKEMATE - Full Database Schema for Supabase
-- Run this in: Supabase > SQL Editor > New Query
-- ============================================

-- ENUMS
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductCategory" AS ENUM ('APPAREL', 'ACCESSORIES', 'SAFETY', 'STICKER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM ('DRIVING_LICENCE', 'VEHICLE_RC', 'INSURANCE', 'PUC', 'POLLUTION_CERTIFICATE', 'AADHAR', 'PAN', 'PASSPORT', 'FITNESS_CERTIFICATE', 'MEDICAL_RECORD', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentPurpose" AS ENUM ('STORE_ORDER', 'SUBSCRIPTION', 'STICKER_ORDER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS "User" (
  "id"                  SERIAL PRIMARY KEY,
  "email"               TEXT UNIQUE,
  "name"                TEXT,
  "password"            TEXT,
  "phone"               TEXT UNIQUE,
  "city"                TEXT,
  "address"             TEXT,
  "role"                "Role" NOT NULL DEFAULT 'USER',
  "otpCode"             TEXT,
  "otpExpiry"           TIMESTAMPTZ,
  "bloodGroup"          TEXT,
  "avatarUrl"           TEXT,
  "avatarPath"          TEXT,
  "guardianName"        TEXT,
  "allergies"           TEXT,
  "medicalNotes"        TEXT,
  "bikeModel"           TEXT,
  "bikeRegNo"           TEXT,
  "bikeYear"            INT,
  "isVolunteer"         BOOLEAN NOT NULL DEFAULT false,
  "volunteerLat"        DOUBLE PRECISION,
  "volunteerLng"        DOUBLE PRECISION,
  "volunteerUpdatedAt"  TIMESTAMPTZ,
  "isLive"              BOOLEAN NOT NULL DEFAULT false,
  "liveLat"             DOUBLE PRECISION,
  "liveLng"             DOUBLE PRECISION,
  "liveUpdatedAt"       TIMESTAMPTZ,
  "subscriptionActive"  BOOLEAN NOT NULL DEFAULT false,
  "subscriptionPlan"    TEXT DEFAULT 'none',
  "subscriptionDays"    INT NOT NULL DEFAULT 0,
  "subscriptionStart"   TIMESTAMPTZ,
  "subscriptionEnd"     TIMESTAMPTZ,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category"    "ProductCategory" NOT NULL DEFAULT 'OTHER',
  "tags"        TEXT,
  "price"       DOUBLE PRECISION NOT NULL,
  "mrp"         DOUBLE PRECISION,
  "gstPercent"  DOUBLE PRECISION NOT NULL DEFAULT 18,
  "stock"       INT NOT NULL DEFAULT 0,
  "trackStock"  BOOLEAN NOT NULL DEFAULT true,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "isFeatured"  BOOLEAN NOT NULL DEFAULT false,
  "sortOrder"   INT NOT NULL DEFAULT 0,
  "images"      JSONB NOT NULL DEFAULT '[]',
  "variants"    JSONB NOT NULL DEFAULT '[]',
  "createdBy"   INT REFERENCES "User"(id),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS "Order" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      INT NOT NULL REFERENCES "User"(id),
  "items"       JSONB NOT NULL,
  "giftWrap"    BOOLEAN NOT NULL DEFAULT false,
  "giftMessage" TEXT,
  "subtotal"    DOUBLE PRECISION NOT NULL,
  "total"       DOUBLE PRECISION NOT NULL,
  "status"      "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "address"     TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS "Payment" (
  "id"                  SERIAL PRIMARY KEY,
  "userId"              INT NOT NULL REFERENCES "User"(id),
  "orderId"             INT REFERENCES "Order"(id),
  "razorpayOrderId"     TEXT NOT NULL UNIQUE,
  "razorpayPaymentId"   TEXT,
  "razorpaySignature"   TEXT,
  "amount"              INT NOT NULL,
  "currency"            TEXT NOT NULL DEFAULT 'INR',
  "purpose"             "PaymentPurpose" NOT NULL DEFAULT 'STORE_ORDER',
  "description"         TEXT,
  "status"              "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "rawPayload"          JSONB,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RIDES TABLE
CREATE TABLE IF NOT EXISTS "Ride" (
  "id"                SERIAL PRIMARY KEY,
  "title"             TEXT NOT NULL,
  "creatorId"         INT NOT NULL REFERENCES "User"(id),
  "startLocation"     TEXT NOT NULL,
  "endLocation"       TEXT NOT NULL,
  "date"              TIMESTAMPTZ NOT NULL,
  "time"              TEXT NOT NULL,
  "estimatedCost"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "description"       TEXT,
  "maxParticipants"   INT NOT NULL DEFAULT 50,
  "isActive"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RIDE PARTICIPANTS (many-to-many)
CREATE TABLE IF NOT EXISTS "_JoinedRides" (
  "A" INT NOT NULL REFERENCES "Ride"(id) ON DELETE CASCADE,
  "B" INT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE("A", "B")
);
CREATE INDEX IF NOT EXISTS "_JoinedRides_A_idx" ON "_JoinedRides"("A");
CREATE INDEX IF NOT EXISTS "_JoinedRides_B_idx" ON "_JoinedRides"("B");

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS "Document" (
  "id"              SERIAL PRIMARY KEY,
  "userId"          INT NOT NULL REFERENCES "User"(id),
  "type"            "DocumentType" NOT NULL,
  "label"           TEXT,
  "fileUrl"         TEXT NOT NULL,
  "filePath"        TEXT NOT NULL,
  "mimeType"        TEXT,
  "fileSizeKB"      INT,
  "issueDate"       TIMESTAMPTZ,
  "expiryDate"      TIMESTAMPTZ,
  "status"          "DocumentStatus" NOT NULL DEFAULT 'VALID',
  "documentNumber"  TEXT,
  "notes"           TEXT,
  "isVerified"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOS TABLE
CREATE TABLE IF NOT EXISTS "SOS" (
  "id"          SERIAL PRIMARY KEY,
  "userId"      INT NOT NULL REFERENCES "User"(id),
  "lat"         DOUBLE PRECISION NOT NULL,
  "lng"         DOUBLE PRECISION NOT NULL,
  "message"     TEXT NOT NULL DEFAULT 'Emergency SOS triggered',
  "resolved"    BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt"  TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRISMA MIGRATIONS TABLE (required by Prisma)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                    VARCHAR(36) NOT NULL PRIMARY KEY,
  "checksum"              VARCHAR(64) NOT NULL,
  "finished_at"           TIMESTAMPTZ,
  "migration_name"        VARCHAR(255) NOT NULL,
  "logs"                  TEXT,
  "rolled_back_at"        TIMESTAMPTZ,
  "started_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count"   INT NOT NULL DEFAULT 0
);

-- AUTO-UPDATE updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['User','Product','Order','Payment','Ride','Document','SOS'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON "%s"', t);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON "%s" FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END $$;

-- Verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
