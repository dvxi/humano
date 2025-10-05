/**
 * Terra Integration - Connect Endpoint
 *
 * Generates Terra widget session for user authentication
 */

import { NextRequest } from 'next/server';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { generateTerraWidgetSession } from '@/integrations/terra/client';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Get selected providers from request body
    const body = await request.json();
    const providers = body.providers || ['FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'STRAVA'];

    // Generate Terra widget session
    const { url, sessionId } = await generateTerraWidgetSession(userId, providers);

    logger.info({ userId, sessionId, providers }, 'Generated Terra widget session');

    return Response.json({
      url,
      sessionId,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to connect Terra integration');
    return errorResponse(error);
  }
}
