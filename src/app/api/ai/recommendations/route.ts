/**
 * AI Recommendations API
 *
 * Generate personalized training recommendations using OpenAI
 */

import { NextRequest } from 'next/server';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { generateRecommendations } from '@/lib/ai/openai';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { subDays } from 'date-fns';

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Get user profile
    const profile = await db.profile.findUnique({
      where: { userId },
    });

    // Get recent metrics (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const metrics = await db.metric.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate averages
    const stepMetrics = metrics.filter((m) => m.type === 'STEPS');
    const sleepMetrics = metrics.filter((m) => m.type === 'SLEEP');
    const heartRateMetrics = metrics.filter((m) => m.type === 'HEART_RATE');
    const calorieMetrics = metrics.filter((m) => m.type === 'CALORIES');

    const avgSteps = stepMetrics.length
      ? stepMetrics.reduce((sum, m) => sum + m.value, 0) / stepMetrics.length
      : undefined;

    const avgSleep = sleepMetrics.length
      ? sleepMetrics.reduce((sum, m) => sum + m.value, 0) / sleepMetrics.length
      : undefined;

    const avgHeartRate = heartRateMetrics.length
      ? heartRateMetrics.reduce((sum, m) => sum + m.value, 0) / heartRateMetrics.length
      : undefined;

    const avgCalories = calorieMetrics.length
      ? calorieMetrics.reduce((sum, m) => sum + m.value, 0) / calorieMetrics.length
      : undefined;

    // Get recent workouts
    const workouts = await db.workout.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // Generate recommendations
    const recommendations = await generateRecommendations({
      profile: {
        age: profile?.age || undefined,
        sex: profile?.sex || undefined,
        weight: profile?.weightKg || undefined,
        height: profile?.heightCm || undefined,
        fitnessLevel: undefined, // Profile model doesn't have fitnessLevel
        goals: undefined, // Profile model doesn't have goals
      },
      recentMetrics: {
        avgSteps,
        avgSleep,
        avgHeartRate,
        avgCalories,
      },
      recentWorkouts: workouts.map((w) => ({
        type: w.activityType,
        duration: w.durationMin || 0,
        date: w.timestamp,
      })),
    });

    logger.info({ userId }, 'Generated AI recommendations');

    return Response.json(recommendations);
  } catch (error) {
    logger.error({ error }, 'Failed to generate recommendations');
    return errorResponse(error);
  }
}
