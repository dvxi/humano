import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const onboardingSchema = z.object({
  role: z.enum(['USER', 'TRAINER']),
  profile: z.object({
    age: z.number().nullable(),
    sex: z.string().nullable(),
    heightCm: z.number().nullable(),
    weightKg: z.number().nullable(),
    location: z.string().nullable(),
  }),
  subscription: z.enum(['FREE_FINDER', 'MONTHLY']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    // Update user role
    await db.user.update({
      where: { id: session.user.id },
      data: { role: data.role },
    });

    // Create profile
    await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data.profile,
      },
      update: data.profile,
    });

    // Create subscription
    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: data.subscription,
        status: 'ACTIVE',
      },
      update: {
        plan: data.subscription,
        status: 'ACTIVE',
      },
    });

    // If trainer, create trainer profile
    if (data.role === 'TRAINER') {
      await db.trainer.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          location: data.profile.location,
        },
        update: {
          location: data.profile.location,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
