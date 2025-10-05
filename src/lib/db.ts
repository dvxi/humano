import { PrismaClient } from '@prisma/client';
import { createLogger } from './logger';

const logger = createLogger('prisma');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Log database connection
db.$connect()
  .then(() => {
    logger.info('Database connected');
  })
  .catch((error) => {
    logger.error({ error }, 'Database connection failed');
  });
