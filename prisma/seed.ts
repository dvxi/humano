import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      profile: {
        create: {
          age: 30,
          sex: 'male',
          heightCm: 180,
          weightKg: 80,
          location: 'Warsaw, Poland',
        },
      },
      subscription: {
        create: {
          plan: 'FREE_FINDER',
          status: 'ACTIVE',
        },
      },
    },
  });

  console.log('✅ Created user:', user.email);

  // Create test trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      email: 'trainer@example.com',
      name: 'John Coach',
      role: 'TRAINER',
      trainer: {
        create: {
          bio: 'Certified personal trainer with 10 years of experience',
          pricePerSession: 50,
          location: 'Warsaw, Poland',
          contact: 'john@example.com',
        },
      },
    },
  });

  console.log('✅ Created trainer:', trainer.email);

  // Create sample metrics for user
  const now = new Date();
  const metrics = await Promise.all([
    prisma.metric.create({
      data: {
        userId: user.id,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        type: 'HRV',
        value: 65,
        unit: 'ms',
      },
    }),
    prisma.metric.create({
      data: {
        userId: user.id,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        type: 'RHR',
        value: 58,
        unit: 'bpm',
      },
    }),
    prisma.metric.create({
      data: {
        userId: user.id,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        type: 'SLEEP',
        value: 7.5,
        unit: 'hours',
      },
    }),
  ]);

  console.log('✅ Created', metrics.length, 'sample metrics');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
