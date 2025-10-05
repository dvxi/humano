import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the integration
    const integration = await db.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Verify ownership
    if (integration.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the integration
    await db.integration.delete({
      where: { id },
    });

    // TODO: Also disconnect from provider API (Vital, Terra, etc.)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Integration delete error:', error);
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
  }
}
