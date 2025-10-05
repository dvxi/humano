import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const workoutSchema = z.object({
  activityType: z.string(),
  timestamp: z.string(),
  sets: z
    .array(
      z.object({
        exercise: z.string(),
        reps: z.number(),
        weight: z.number(),
      })
    )
    .optional(),
  volumeLoad: z.number().optional(),
  rpe: z.number().min(1).max(10).nullable(),
  durationMin: z.number().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = workoutSchema.parse(body);

    const workout = await db.workout.create({
      data: {
        userId: session.user.id,
        timestamp: new Date(data.timestamp),
        activityType: data.activityType,
        sets: data.sets || [],
        volumeLoad: data.volumeLoad,
        rpe: data.rpe,
        durationMin: data.durationMin,
      },
    });

    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error('Workout creation error:', error);
    return NextResponse.json({ error: 'Failed to log workout' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const workouts = await db.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Workout fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
