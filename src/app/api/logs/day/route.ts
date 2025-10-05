import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const dayLogSchema = z.object({
  timestamp: z.string(),
  hydration: z.number().nullable(),
  meals: z.number().nullable(),
  steps: z.number().nullable(),
  temperature: z.number().nullable(),
  pressure: z.number().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = dayLogSchema.parse(body);

    const timestamp = new Date(data.timestamp);

    // Store each metric separately
    const metrics = [];

    if (data.hydration !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'HYDRATION' as const,
        value: data.hydration,
        unit: 'liters',
      });
    }

    if (data.steps !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'STEPS' as const,
        value: data.steps,
        unit: 'steps',
      });
    }

    if (data.temperature !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'TEMP' as const,
        value: data.temperature,
        unit: '°C',
      });
    }

    if (data.pressure !== null) {
      metrics.push({
        userId: session.user.id,
        timestamp,
        type: 'PRESSURE' as const,
        value: data.pressure,
        unit: 'hPa',
      });
    }

    await db.metric.createMany({
      data: metrics,
    });

    return NextResponse.json({ success: true, count: metrics.length });
  } catch (error) {
    console.error('Day log error:', error);
    return NextResponse.json({ error: 'Failed to log day report' }, { status: 500 });
  }
}
