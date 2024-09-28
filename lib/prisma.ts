import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.DATABASE_URL);

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test the database connection
prisma.$connect()
  .then(() => console.log('Database connection successful'))
  .catch((e) => console.error('Database connection failed:', e));