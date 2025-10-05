import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        db: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
