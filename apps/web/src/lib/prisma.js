import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Disable query logging in production for performance
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

// Cache the client globally to prevent creating new connections on every request
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// Also cache in production on Vercel (serverless functions reuse global scope)
globalForPrisma.prisma = prisma;

export default prisma;
