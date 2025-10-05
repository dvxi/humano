import { createLogger } from '@/lib/logger';

const logger = createLogger('vital-client');

const VITAL_API_URL = 'https://api.tryvital.io/v2';

interface VitalConfig {
  apiKey: string;
  environment?: 'sandbox' | 'production';
}

export class VitalClient {
  private apiKey: string;
  private environment: string;

  constructor(config: VitalConfig) {
    this.apiKey = config.apiKey;
    this.environment = config.environment || 'sandbox';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${VITAL_API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'x-vital-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error({ endpoint, status: response.status, error }, 'Vital API error');
      throw new Error(`Vital API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Create a link token for user to connect their device
   */
  async createLinkToken(userId: string) {
    logger.info({ userId }, 'Creating Vital link token');

    const response = await this.request('/link/token', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    return response;
  }

  /**
   * Get user's connected providers
   */
  async getUserProviders(userId: string) {
    logger.info({ userId }, 'Fetching user providers');

    const response = await this.request(`/user/providers/${userId}`);
    return response;
  }

  /**
   * Disconnect a provider for a user
   */
  async disconnectProvider(userId: string, provider: string) {
    logger.info({ userId, provider }, 'Disconnecting provider');

    await this.request(`/user/${userId}/provider/${provider}`, {
      method: 'DELETE',
    });

    return { success: true };
  }

  /**
   * Get user's sleep data
   */
  async getSleepData(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await this.request(`/summary/sleep/${userId}?${params.toString()}`);
    return response;
  }

  /**
   * Get user's activity data
   */
  async getActivityData(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await this.request(`/summary/activity/${userId}?${params.toString()}`);
    return response;
  }

  /**
   * Get user's workout data
   */
  async getWorkouts(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await this.request(`/timeseries/workouts/${userId}?${params.toString()}`);
    return response;
  }
}

// Singleton instance
let vitalClient: VitalClient | null = null;

export function getVitalClient(): VitalClient {
  if (!vitalClient) {
    const apiKey = process.env.VITAL_API_KEY;

    if (!apiKey) {
      throw new Error('VITAL_API_KEY is not configured');
    }

    vitalClient = new VitalClient({
      apiKey,
      environment: (process.env.VITAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    });
  }

  return vitalClient;
}
