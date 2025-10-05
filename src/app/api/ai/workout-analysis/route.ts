/**
 * AI Workout Analysis API
 *
 * Analyze completed workouts and provide feedback
 */

import { NextRequest } from 'next/server';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { analyzeWorkout } from '@/lib/ai/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Analyze workout
    const analysis = await analyzeWorkout({
      type: body.type,
      duration: body.duration,
      calories: body.calories,
      heartRate: body.heartRate,
      notes: body.notes,
    });

    logger.info({ userId, workoutType: body.type }, 'Analyzed workout');

    return Response.json(analysis);
  } catch (error) {
    logger.error({ error }, 'Failed to analyze workout');
    return errorResponse(error);
  }
}
