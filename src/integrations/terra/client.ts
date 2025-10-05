/**
 * Terra API Client
 *
 * Unified API for wearables and fitness data
 * Supports: Fitbit, Garmin, Oura, Whoop, Strava, and 30+ more
 *
 * @see https://docs.tryterra.co/
 */

import { logger } from '@/lib/logger';
import crypto from 'node:crypto';

const TERRA_API_BASE = 'https://api.tryterra.co/v2';

interface TerraConfig {
  devId: string;
  apiKey: string;
  signingSecret: string;
}

function getTerraConfig(): TerraConfig {
  const devId = process.env.TERRA_DEV_ID;
  const apiKey = process.env.TERRA_API_KEY;
  const signingSecret = process.env.TERRA_SIGNING_SECRET;

  if (!devId || !apiKey || !signingSecret) {
    throw new Error('Terra API credentials not configured');
  }

  return { devId, apiKey, signingSecret };
}

export type TerraProvider =
  | 'FITBIT'
  | 'GARMIN'
  | 'OURA'
  | 'WHOOP'
  | 'STRAVA'
  | 'PELOTON'
  | 'APPLE'
  | 'GOOGLE'
  | 'SAMSUNG'
  | 'WITHINGS'
  | 'POLAR'
  | 'SUUNTO'
  | 'WAHOO'
  | 'ZWIFT';

/**
 * Generate Terra widget session for user authentication
 */
export async function generateTerraWidgetSession(
  userId: string,
  providers: TerraProvider[] = ['FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'STRAVA']
) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const response = await fetch(`${TERRA_API_BASE}/auth/generateWidgetSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'dev-id': devId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        reference_id: userId,
        providers,
        language: 'en',
        auth_success_redirect_url: `${process.env.NEXTAUTH_URL}/dashboard/integrations?success=true`,
        auth_failure_redirect_url: `${process.env.NEXTAUTH_URL}/dashboard/integrations?error=auth_failed`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    const data = await response.json();
    logger.info({ userId, providers }, 'Generated Terra widget session');

    return {
      url: data.url as string,
      sessionId: data.session_id as string,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to generate Terra widget session');
    throw error;
  }
}

/**
 * Get user's activity data
 */
export async function getTerraActivity(terraUserId: string, startDate: string, endDate: string) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const url = new URL(`${TERRA_API_BASE}/activity`);
    url.searchParams.set('user_id', terraUserId);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url.toString(), {
      headers: {
        'dev-id': devId,
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error({ error, terraUserId, startDate, endDate }, 'Failed to get Terra activity');
    throw error;
  }
}

/**
 * Get user's body metrics
 */
export async function getTerraBody(terraUserId: string, startDate: string, endDate: string) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const url = new URL(`${TERRA_API_BASE}/body`);
    url.searchParams.set('user_id', terraUserId);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url.toString(), {
      headers: {
        'dev-id': devId,
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error({ error, terraUserId, startDate, endDate }, 'Failed to get Terra body data');
    throw error;
  }
}

/**
 * Get user's sleep data
 */
export async function getTerraSleep(terraUserId: string, startDate: string, endDate: string) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const url = new URL(`${TERRA_API_BASE}/sleep`);
    url.searchParams.set('user_id', terraUserId);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url.toString(), {
      headers: {
        'dev-id': devId,
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error({ error, terraUserId, startDate, endDate }, 'Failed to get Terra sleep data');
    throw error;
  }
}

/**
 * Get user's nutrition data
 */
export async function getTerraNutrition(terraUserId: string, startDate: string, endDate: string) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const url = new URL(`${TERRA_API_BASE}/nutrition`);
    url.searchParams.set('user_id', terraUserId);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url.toString(), {
      headers: {
        'dev-id': devId,
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error({ error, terraUserId, startDate, endDate }, 'Failed to get Terra nutrition data');
    throw error;
  }
}

/**
 * Deauthenticate user
 */
export async function deauthenticateTerraUser(terraUserId: string) {
  const { devId, apiKey } = getTerraConfig();

  try {
    const response = await fetch(`${TERRA_API_BASE}/auth/deauthenticateUser`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'dev-id': devId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        user_id: terraUserId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Terra API error: ${error}`);
    }

    logger.info({ terraUserId }, 'Deauthenticated Terra user');
    return true;
  } catch (error) {
    logger.error({ error, terraUserId }, 'Failed to deauthenticate Terra user');
    throw error;
  }
}

/**
 * Verify Terra webhook signature
 */
export function verifyTerraWebhookSignature(payload: string, signature: string): boolean {
  const { signingSecret } = getTerraConfig();

  const expectedSignature = crypto
    .createHmac('sha256', signingSecret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
