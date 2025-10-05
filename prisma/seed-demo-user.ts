/**
 * Demo User Seed Script
 *
 * Seeds 90 days of realistic archival data for user: cmgdeu3k70000z5zctfzo1aw5
 *
 * Data includes:
 * - Profile with realistic stats
 * - Daily metrics (sleep, steps, heart rate, HRV, weight, hydration, mood, stress)
 * - Workouts (strength training, cardio, rest days)
 * - Connected integrations
 * - Reminders
 * - Notifications
 *
 * Run with: pnpm tsx prisma/seed-demo-user.ts
 */

import { PrismaClient } from '@prisma/client';
import { subDays, format } from 'date-fns';

const prisma = new PrismaClient();

const DEMO_USER_ID = 'cmgdeu3k70000z5zctfzo1aw5';
const DAYS_OF_DATA = 90;

// Helper to generate realistic variation
function addVariation(base: number, variance: number): number {
  return base + (Math.random() - 0.5) * variance * 2;
}

// Helper to generate trend (improving over time)
function withTrend(base: number, day: number, totalDays: number, improvement: number): number {
  const progress = day / totalDays;
  return base + improvement * progress;
}

async function main() {
  console.log('🌱 Seeding demo user data...');

  // 1. Update user profile
  console.log('📝 Creating profile...');
  await prisma.profile.upsert({
    where: { userId: DEMO_USER_ID },
    create: {
      userId: DEMO_USER_ID,
      age: 28,
      sex: 'Male',
      heightCm: 178,
      weightKg: 82.5,
      location: 'San Francisco, CA',
      ethnicity: 'Caucasian',
    },
    update: {
      age: 28,
      sex: 'Male',
      heightCm: 178,
      weightKg: 82.5,
      location: 'San Francisco, CA',
      ethnicity: 'Caucasian',
    },
  });

  // 2. Add integrations
  console.log('🔗 Creating integrations...');
  await prisma.integration.upsert({
    where: {
      userId_provider: {
        userId: DEMO_USER_ID,
        provider: 'VITAL',
      },
    },
    create: {
      userId: DEMO_USER_ID,
      provider: 'VITAL',
      status: 'CONNECTED',
      meta: { vitalProvider: 'OURA', connectedAt: subDays(new Date(), 85).toISOString() },
    },
    update: {
      status: 'CONNECTED',
      meta: { vitalProvider: 'OURA', connectedAt: subDays(new Date(), 85).toISOString() },
    },
  });

  await prisma.integration.upsert({
    where: {
      userId_provider: {
        userId: DEMO_USER_ID,
        provider: 'APPLE_HEALTH',
      },
    },
    create: {
      userId: DEMO_USER_ID,
      provider: 'APPLE_HEALTH',
      status: 'CONNECTED',
      meta: { connectedAt: subDays(new Date(), 80).toISOString() },
    },
    update: {
      status: 'CONNECTED',
      meta: { connectedAt: subDays(new Date(), 80).toISOString() },
    },
  });

  // 3. Add reminders
  console.log('⏰ Creating reminders...');
  await prisma.reminder.upsert({
    where: { id: 'demo-reminder-morning' },
    create: {
      id: 'demo-reminder-morning',
      userId: DEMO_USER_ID,
      kind: 'MORNING',
      schedule: '08:00',
      enabled: true,
    },
    update: {
      schedule: '08:00',
      enabled: true,
    },
  });

  await prisma.reminder.upsert({
    where: { id: 'demo-reminder-day' },
    create: {
      id: 'demo-reminder-day',
      userId: DEMO_USER_ID,
      kind: 'DAY',
      schedule: '20:00',
      enabled: true,
    },
    update: {
      schedule: '20:00',
      enabled: true,
    },
  });

  // 4. Generate 90 days of data
  console.log(`📊 Generating ${DAYS_OF_DATA} days of metrics and workouts...`);

  const metrics = [];
  const workouts = [];

  // Starting values
  let currentWeight = 85.0; // Starting weight (will trend down)
  const targetWeight = 82.5;
  const weightLossPerDay = (currentWeight - targetWeight) / DAYS_OF_DATA;

  for (let i = DAYS_OF_DATA; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Simulate weight loss journey
    currentWeight -= weightLossPerDay + addVariation(0, 0.1);

    // Daily metrics
    // Sleep (improving over time: 6.5 → 7.5 hours)
    const sleepHours = withTrend(6.5, DAYS_OF_DATA - i, DAYS_OF_DATA, 1.0) + addVariation(0, 0.5);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(7, 0, 0, 0)),
      type: 'SLEEP',
      value: Math.max(5, Math.min(9, sleepHours)),
      unit: 'hours',
      meta: { source: 'VITAL', quality: sleepHours > 7 ? 'good' : 'fair' },
    });

    // Sleep Quality (improving: 3 → 4.5)
    const sleepQuality = withTrend(3, DAYS_OF_DATA - i, DAYS_OF_DATA, 1.5) + addVariation(0, 0.3);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(7, 5, 0, 0)),
      type: 'SLEEP_QUALITY',
      value: Math.max(1, Math.min(5, sleepQuality)),
      unit: 'score',
      meta: { source: 'manual' },
    });

    // HRV (improving: 45 → 65 ms)
    const hrv = withTrend(45, DAYS_OF_DATA - i, DAYS_OF_DATA, 20) + addVariation(0, 5);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(7, 10, 0, 0)),
      type: 'HRV',
      value: Math.max(30, Math.min(80, hrv)),
      unit: 'ms',
      meta: { source: 'VITAL' },
    });

    // RHR (improving: 68 → 58 bpm)
    const rhr = withTrend(68, DAYS_OF_DATA - i, DAYS_OF_DATA, -10) + addVariation(0, 2);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(7, 15, 0, 0)),
      type: 'RHR',
      value: Math.max(50, Math.min(75, rhr)),
      unit: 'bpm',
      meta: { source: 'VITAL' },
    });

    // Morning mood (improving: 3 → 4)
    const mood = withTrend(3, DAYS_OF_DATA - i, DAYS_OF_DATA, 1) + addVariation(0, 0.5);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(8, 0, 0, 0)),
      type: 'MOOD',
      value: Math.max(1, Math.min(5, mood)),
      unit: 'score',
      meta: { source: 'manual', time: 'morning' },
    });

    // Stress level (decreasing: 4 → 2.5)
    const stress = withTrend(4, DAYS_OF_DATA - i, DAYS_OF_DATA, -1.5) + addVariation(0, 0.5);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(8, 5, 0, 0)),
      type: 'STRESS',
      value: Math.max(1, Math.min(5, stress)),
      unit: 'score',
      meta: { source: 'manual' },
    });

    // Weight (trending down)
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(8, 10, 0, 0)),
      type: 'WEIGHT',
      value: Math.round(currentWeight * 10) / 10,
      unit: 'kg',
      meta: { source: 'manual' },
    });

    // Steps (higher on weekdays, lower on weekends)
    const baseSteps = isWeekend ? 7000 : 10000;
    const steps =
      withTrend(baseSteps, DAYS_OF_DATA - i, DAYS_OF_DATA, 2000) + addVariation(0, 1500);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(22, 0, 0, 0)),
      type: 'STEPS',
      value: Math.max(3000, Math.min(15000, steps)),
      unit: 'steps',
      meta: { source: 'APPLE_HEALTH' },
    });

    // Calories burned
    const calories = 1800 + (steps / 100) * 5 + addVariation(0, 100);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(22, 5, 0, 0)),
      type: 'CALORIES',
      value: Math.round(calories),
      unit: 'kcal',
      meta: { source: 'APPLE_HEALTH' },
    });

    // Hydration (improving: 1.5 → 2.5 liters)
    const hydration = withTrend(1.5, DAYS_OF_DATA - i, DAYS_OF_DATA, 1.0) + addVariation(0, 0.3);
    metrics.push({
      userId: DEMO_USER_ID,
      timestamp: new Date(date.setHours(20, 0, 0, 0)),
      type: 'HYDRATION',
      value: Math.max(1, Math.min(4, hydration)),
      unit: 'liters',
      meta: { source: 'manual' },
    });

    // Workouts (Mon/Wed/Fri: Strength, Tue/Thu: Cardio, Sat: Active Recovery, Sun: Rest)
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      // Strength Training
      const exercises = [
        { exercise: 'Squat', reps: 8, weight: 80 + (DAYS_OF_DATA - i) * 0.3 },
        { exercise: 'Bench Press', reps: 8, weight: 60 + (DAYS_OF_DATA - i) * 0.2 },
        { exercise: 'Deadlift', reps: 6, weight: 100 + (DAYS_OF_DATA - i) * 0.4 },
        { exercise: 'Pull-ups', reps: 10, weight: 0 },
      ];

      const volumeLoad = exercises.reduce((sum, ex) => sum + ex.reps * ex.weight, 0);
      const rpe = Math.round(7 + addVariation(0, 1));

      workouts.push({
        userId: DEMO_USER_ID,
        timestamp: new Date(date.setHours(18, 0, 0, 0)),
        activityType: 'Strength Training',
        sets: exercises,
        volumeLoad,
        rpe: Math.max(1, Math.min(10, rpe)),
        durationMin: 60 + Math.round(addVariation(0, 10)),
        meta: { location: 'gym', exercises: exercises.length },
      });

      // Add soreness next day
      if (i > 0) {
        const soreness = 3 + addVariation(0, 1);
        metrics.push({
          userId: DEMO_USER_ID,
          timestamp: new Date(subDays(date, -1).setHours(8, 15, 0, 0)),
          type: 'SORENESS',
          value: Math.max(1, Math.min(5, soreness)),
          unit: 'score',
          meta: { source: 'manual', muscleGroup: 'full-body' },
        });
      }
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      // Cardio
      const duration = 30 + Math.round(addVariation(0, 10));
      const distance = duration / 5 + addVariation(0, 1); // ~6 min/km pace
      const avgHeartRate = 145 + Math.round(addVariation(0, 10));

      workouts.push({
        userId: DEMO_USER_ID,
        timestamp: new Date(date.setHours(7, 0, 0, 0)),
        activityType: 'Running',
        durationMin: duration,
        rpe: Math.round(6 + addVariation(0, 1)),
        meta: {
          distance: Math.round(distance * 10) / 10,
          avgHeartRate,
          pace: Math.round((duration / distance) * 10) / 10,
        },
      });

      // Heart rate during workout
      metrics.push({
        userId: DEMO_USER_ID,
        timestamp: new Date(date.setHours(7, 15, 0, 0)),
        type: 'HEART_RATE',
        value: avgHeartRate,
        unit: 'bpm',
        meta: { source: 'APPLE_HEALTH', activity: 'running' },
      });
    } else if (dayOfWeek === 6) {
      // Saturday: Active Recovery (Yoga/Stretching)
      workouts.push({
        userId: DEMO_USER_ID,
        timestamp: new Date(date.setHours(10, 0, 0, 0)),
        activityType: 'Yoga',
        durationMin: 45,
        rpe: 3,
        meta: { type: 'recovery', focus: 'flexibility' },
      });
    }
    // Sunday: Rest day (no workout)
  }

  // Batch insert metrics
  console.log(`💾 Inserting ${metrics.length} metrics...`);
  await prisma.metric.createMany({
    data: metrics,
    skipDuplicates: true,
  });

  // Batch insert workouts
  console.log(`💪 Inserting ${workouts.length} workouts...`);
  await prisma.workout.createMany({
    data: workouts,
    skipDuplicates: true,
  });

  // 5. Add some notifications
  console.log('🔔 Creating notifications...');
  const notifications = [
    {
      userId: DEMO_USER_ID,
      title: 'Great progress!',
      body: "You've completed 12 workouts this month. Keep it up!",
      createdAt: subDays(new Date(), 7),
    },
    {
      userId: DEMO_USER_ID,
      title: 'New personal record',
      body: 'You hit a new PR on your squat: 105kg! 🎉',
      createdAt: subDays(new Date(), 14),
      readAt: subDays(new Date(), 13),
    },
    {
      userId: DEMO_USER_ID,
      title: 'Sleep improvement detected',
      body: 'Your average sleep has improved by 45 minutes over the past month.',
      createdAt: subDays(new Date(), 21),
      readAt: subDays(new Date(), 20),
    },
    {
      userId: DEMO_USER_ID,
      title: 'Weekly summary',
      body: 'This week: 5 workouts, 12,450 avg steps, 7.2hrs avg sleep',
      createdAt: subDays(new Date(), 3),
    },
  ];

  await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });

  console.log('✅ Demo user data seeded successfully!');
  console.log(`
📊 Summary:
- Profile: Updated
- Integrations: 2 (Vital/Oura, Apple Health)
- Reminders: 2 (Morning, Day)
- Metrics: ${metrics.length} data points
- Workouts: ${workouts.length} sessions
- Notifications: ${notifications.length} messages
- Date range: ${format(subDays(new Date(), DAYS_OF_DATA), 'MMM dd, yyyy')} - ${format(new Date(), 'MMM dd, yyyy')}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
