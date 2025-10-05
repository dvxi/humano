import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const morningLogSchema = z.object({
  timestamp: z.string(),
  mood: z.number().min(1).max(5).nullable(),
  stress: z.number().min(1).max(5).nullable(),
  soreness: z.number().min(1).max(5).nullable(),
  sleepQuality: z.number().min(1).max(5).nullable(),
  sleepHours: z.number().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = morningLogSchema.parse(body);

    const timestamp = new Date(data.timestamp);

    // Store each metric separately
    const metrics = [];

    if (data.mood !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'MOOD' as const,
        value: data.mood,
        unit: 'score',
      });
    }

    if (data.stress !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'STRESS' as const,
        value: data.stress,
        unit: 'score',
      });
    }

    if (data.soreness !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'SORENESS' as const,
        value: data.soreness,
        unit: 'score',
      });
    }

    if (data.sleepQuality !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'SLEEP_QUALITY' as const,
        value: data.sleepQuality,
        unit: 'score',
      });
    }

    if (data.sleepHours !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'SLEEP' as const,
        value: data.sleepHours,
        unit: 'hours',
      });
    }

    await db.metric.createMany({
      data: metrics,
    });

    return NextResponse.json({ success: true, count: metrics.length });
  } catch (error) {
    console.error('Morning log error:', error);
    return NextResponse.json({ error: 'Failed to log morning report' }, { status: 500 });
  }
}
