import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection
    const userCount = await db.user.count();

    // Test Account table (needed for OAuth)
    const accountCount = await db.account.count();

    // Test Session table (needed for login)
    const sessionCount = await db.session.count();

    return NextResponse.json({
      ok: true,
      userCount,
      accountCount,
      sessionCount,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
