/**
 * AI Questionnaire Normalization API
 *
 * Process and normalize onboarding questionnaire responses
 */

import { NextRequest } from 'next/server';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { normalizeQuestionnaire } from '@/lib/ai/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Normalize questionnaire responses
    const normalized = await normalizeQuestionnaire(body.responses);

    logger.info({ userId }, 'Normalized questionnaire responses');

    return Response.json(normalized);
  } catch (error) {
    logger.error({ error }, 'Failed to normalize questionnaire');
    return errorResponse(error);
  }
}
