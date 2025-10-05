/**
 * Terra Webhook Handler
 *
 * Receives and processes Terra webhook events
 *
 * Events:
 * - auth: User successfully connected
 * - deauth: User disconnected
 * - activity: New activity data
 * - body: New body metrics
 * - sleep: New sleep data
 * - nutrition: New nutrition data
 * - workout: New workout data
 *
 * @see https://docs.tryterra.co/webhooks
 */

import { NextRequest } from 'next/server';
import { verifyTerraWebhookSignature } from '@/integrations/terra/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleAuthEvent(payload: any) {
  const { user, status } = payload;
  const { reference_id: userId, user_id: terraUserId, provider } = user;

  if (status !== 'success') {
    logger.warn({ userId, provider, status }, 'Terra auth failed');
    return;
  }

  // Create or update integration
  await db.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider: 'TERRA',
      },
    },
    create: {
      userId,
      provider: 'TERRA',
      providerUserId: terraUserId,
      accessToken: '', // Terra doesn't expose access tokens
      status: 'CONNECTED',
      metadata: { terraProvider: provider },
    },
    update: {
      providerUserId: terraUserId,
      status: 'CONNECTED',
      metadata: { terraProvider: provider },
      connectedAt: new Date(),
    },
  });

  logger.info({ userId, terraUserId, provider }, 'Terra user authenticated');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDeauthEvent(payload: any) {
  const { user } = payload;
  const { reference_id: userId, user_id: terraUserId } = user;

  // Update integration status
  await db.integration.updateMany({
    where: {
      userId,
      provider: 'TERRA',
      providerUserId: terraUserId,
    },
    data: {
      status: 'DISCONNECTED',
    },
  });

  logger.info({ userId, terraUserId }, 'Terra user deauthenticated');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleActivityEvent(payload: any) {
  const { user, data } = payload;
  const { reference_id: userId } = user;

  if (!data || data.length === 0) return;

  const activityData = data[0];
  const { metadata, distance_data, calories_data, active_durations_data } = activityData;

  // Store metrics
  const metrics = [];

  if (distance_data?.steps) {
    metrics.push({
      userId,
      type: 'STEPS',
      value: distance_data.steps,
      unit: 'steps',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (calories_data?.total_burned_calories) {
    metrics.push({
      userId,
      type: 'CALORIES',
      value: calories_data.total_burned_calories,
      unit: 'kcal',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (active_durations_data?.activity_seconds) {
    metrics.push({
      userId,
      type: 'ACTIVE_MINUTES',
      value: Math.round(active_durations_data.activity_seconds / 60),
      unit: 'minutes',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({
      data: metrics,
      skipDuplicates: true,
    });

    logger.info({ userId, metricCount: metrics.length }, 'Stored Terra activity metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBodyEvent(payload: any) {
  const { user, data } = payload;
  const { reference_id: userId } = user;

  if (!data || data.length === 0) return;

  const bodyData = data[0];
  const { metadata, measurements } = bodyData;

  const metrics = [];

  if (measurements?.weight_kg) {
    metrics.push({
      userId,
      type: 'WEIGHT',
      value: measurements.weight_kg,
      unit: 'kg',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (measurements?.heart_rate_bpm) {
    metrics.push({
      userId,
      type: 'HEART_RATE',
      value: measurements.heart_rate_bpm,
      unit: 'bpm',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (measurements?.body_fat_percentage) {
    metrics.push({
      userId,
      type: 'BODY_FAT',
      value: measurements.body_fat_percentage,
      unit: '%',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({
      data: metrics,
      skipDuplicates: true,
    });

    logger.info({ userId, metricCount: metrics.length }, 'Stored Terra body metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSleepEvent(payload: any) {
  const { user, data } = payload;
  const { reference_id: userId } = user;

  if (!data || data.length === 0) return;

  const sleepData = data[0];
  const { metadata, sleep_durations_data } = sleepData;

  const metrics = [];

  if (sleep_durations_data?.asleep_duration_seconds) {
    metrics.push({
      userId,
      type: 'SLEEP',
      value: Math.round(sleep_durations_data.asleep_duration_seconds / 3600),
      unit: 'hours',
      timestamp: new Date(metadata.start_time),
      meta: { source: 'TERRA' },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({
      data: metrics,
      skipDuplicates: true,
    });

    logger.info({ userId, metricCount: metrics.length }, 'Stored Terra sleep metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleWorkoutEvent(payload: any) {
  const { user, data } = payload;
  const { reference_id: userId } = user;

  if (!data || data.length === 0) return;

  const workoutData = data[0];
  const { metadata, name, calories_data, distance_data } = workoutData;

  // Store workout
  await db.workout.create({
    data: {
      userId,
      timestamp: new Date(metadata.start_time),
      activityType: name || 'Unknown',
      durationMin: Math.round(
        (new Date(metadata.end_time).getTime() - new Date(metadata.start_time).getTime()) / 60000
      ),
      meta: {
        source: 'terra',
        calories: calories_data?.total_burned_calories || null,
        distance: distance_data?.distance_meters || null,
        notes: 'Synced from Terra',
      },
    },
  });

  logger.info({ userId, workoutType: name }, 'Stored Terra workout');
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('terra-signature');

    if (!signature) {
      logger.warn('Missing Terra webhook signature');
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify signature
    const isValid = verifyTerraWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('Invalid Terra webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const { type } = payload;

    logger.info({ type }, 'Received Terra webhook');

    // Handle different event types
    switch (type) {
      case 'auth':
        await handleAuthEvent(payload);
        break;
      case 'deauth':
        await handleDeauthEvent(payload);
        break;
      case 'activity':
        await handleActivityEvent(payload);
        break;
      case 'body':
        await handleBodyEvent(payload);
        break;
      case 'sleep':
        await handleSleepEvent(payload);
        break;
      case 'nutrition':
        // TODO: Implement nutrition data handling
        logger.info('Nutrition webhook received (not yet implemented)');
        break;
      case 'workout':
        await handleWorkoutEvent(payload);
        break;
      default:
        logger.warn({ type }, 'Unknown Terra webhook type');
    }

    return Response.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to process Terra webhook');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
