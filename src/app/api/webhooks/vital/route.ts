import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import crypto from 'crypto';

const logger = createLogger('vital-webhook');

/**
 * Verify Vital webhook signature
 * Note: This is a simplified version. In production, implement proper signature verification
 * according to Vital's documentation.
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    logger.warn('No signature provided');
    return false;
  }

  const webhookSecret = process.env.VITAL_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('VITAL_WEBHOOK_SECRET not configured - skipping verification');
    // In development, allow webhooks without verification
    return process.env.NODE_ENV === 'development';
  }

  try {
    // Vital uses HMAC SHA-256 for signature verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    logger.error({ error }, 'Signature verification error');
    return false;
  }
}

/**
 * Handle Vital webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-vital-signature');
    const payload = await req.text();

    // Verify signature
    if (!verifySignature(payload, signature)) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    logger.info({ eventType: event.event_type, userId: event.user_id }, 'Webhook received');

    // Handle different event types
    switch (event.event_type) {
      case 'daily.data.sleep.created':
      case 'daily.data.sleep.updated':
        await handleSleepData(event);
        break;

      case 'daily.data.activity.created':
      case 'daily.data.activity.updated':
        await handleActivityData(event);
        break;

      case 'daily.data.body.created':
      case 'daily.data.body.updated':
        await handleBodyData(event);
        break;

      case 'daily.workouts.created':
      case 'daily.workouts.updated':
      case 'daily.data.workout_distance.created':
      case 'daily.data.workout_duration.created':
      case 'daily.data.workout_stream.created':
        await handleWorkoutData(event);
        break;

      case 'user.connected':
        await handleUserConnected(event);
        break;

      case 'user.disconnected':
        await handleUserDisconnected(event);
        break;

      default:
        logger.info({ eventType: event.event_type }, 'Unhandled event type');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Webhook processing error');
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSleepData(event: any) {
  const { user_id, client_user_id, data } = event;
  const userId = client_user_id || user_id;

  const metrics = [];
  const timestamp = new Date(data.date);

  // HRV
  if (data.sleep?.hrv?.avg_hrv_rmssd) {
    metrics.push({
      userId,
      timestamp,
      type: 'HRV' as const,
      value: data.sleep.hrv.avg_hrv_rmssd,
      unit: 'ms',
      meta: { source: 'vital' },
    });
  }

  // Resting Heart Rate
  if (data.sleep?.heart_rate?.avg_hr_bpm) {
    metrics.push({
      userId,
      timestamp,
      type: 'RHR' as const,
      value: data.sleep.heart_rate.avg_hr_bpm,
      unit: 'bpm',
      meta: { source: 'vital' },
    });
  }

  // Sleep Duration (convert seconds to hours)
  if (data.sleep?.duration) {
    metrics.push({
      userId,
      timestamp,
      type: 'SLEEP' as const,
      value: data.sleep.duration / 3600,
      unit: 'hours',
      meta: { source: 'vital', efficiency: data.sleep.efficiency },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({ data: metrics });
    logger.info({ userId, count: metrics.length }, 'Stored sleep metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleActivityData(event: any) {
  const { user_id, client_user_id, data } = event;
  const userId = client_user_id || user_id;

  const metrics = [];
  const timestamp = new Date(data.date);

  // Steps
  if (data.activity?.steps) {
    metrics.push({
      userId,
      timestamp,
      type: 'STEPS' as const,
      value: data.activity.steps,
      unit: 'steps',
      meta: { source: 'vital' },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({ data: metrics });
    logger.info({ userId, count: metrics.length }, 'Stored activity metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBodyData(event: any) {
  const { user_id, client_user_id, data } = event;
  const userId = client_user_id || user_id;

  const metrics = [];
  const timestamp = new Date(data.date);

  // Weight
  if (data.body?.weight_kg) {
    metrics.push({
      userId,
      timestamp,
      type: 'WEIGHT' as const,
      value: data.body.weight_kg,
      unit: 'kg',
      meta: { source: 'vital' },
    });
  }

  // Body Fat
  if (data.body?.body_fat_percentage) {
    metrics.push({
      userId,
      timestamp,
      type: 'BODY_FAT' as const,
      value: data.body.body_fat_percentage,
      unit: '%',
      meta: { source: 'vital' },
    });
  }

  if (metrics.length > 0) {
    await db.metric.createMany({ data: metrics });
    logger.info({ userId, count: metrics.length }, 'Stored body metrics');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleWorkoutData(event: any) {
  const { user_id, client_user_id, data } = event;
  const userId = client_user_id || user_id;

  if (data.workout) {
    await db.workout.create({
      data: {
        userId,
        timestamp: new Date(data.workout.start),
        activityType: data.workout.sport || 'other',
        durationMin: data.workout.duration ? Math.round(data.workout.duration / 60) : null,
        meta: {
          source: 'vital',
          calories: data.workout.calories,
          heartRate: data.workout.heart_rate,
        },
      },
    });

    logger.info({ userId, workoutId: data.workout.id }, 'Stored workout');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleUserConnected(event: any) {
  const { user_id, client_user_id, provider } = event;
  const userId = client_user_id || user_id;

  await db.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider: 'VITAL',
      },
    },
    create: {
      userId,
      provider: 'VITAL',
      status: 'CONNECTED',
      meta: { vitalProvider: provider },
    },
    update: {
      status: 'CONNECTED',
      meta: { vitalProvider: provider },
    },
  });

  logger.info({ userId, provider }, 'User connected');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleUserDisconnected(event: any) {
  const { user_id, client_user_id } = event;
  const userId = client_user_id || user_id;

  await db.integration.updateMany({
    where: {
      userId,
      provider: 'VITAL',
    },
    data: {
      status: 'DISCONNECTED',
    },
  });

  logger.info({ userId }, 'User disconnected');
}
