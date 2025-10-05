import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Mark this route as dynamic since it uses authentication
export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  name: z.string().optional(),
  profile: z.object({
    age: z.number().nullable(),
    sex: z.string().nullable(),
    heightCm: z.number().nullable(),
    weightKg: z.number().nullable(),
    location: z.string().nullable(),
    ethnicity: z.string().nullable(),
  }),
  trainer: z
    .object({
      bio: z.string().nullable(),
      pricePerSession: z.number().nullable(),
      location: z.string().nullable(),
      contact: z.string().nullable(),
    })
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = profileSchema.parse(body);

    // Update user name if provided
    if (data.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      });
    }

    // Update profile
    await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data.profile,
      },
      update: data.profile,
    });

    // Update trainer profile if provided
    if (data.trainer) {
      await db.trainer.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...data.trainer,
        },
        update: data.trainer,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
