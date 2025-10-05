/**
 * Stripe Client
 *
 * Payment processing for subscriptions
 *
 * @see https://stripe.com/docs
 *
 * TODO: Add Stripe API keys to .env to enable payments
 * - STRIPE_SECRET_KEY
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

import Stripe from 'stripe';
import { logger } from './logger';

// Check if Stripe is configured
const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

if (!isStripeConfigured) {
  logger.warn('Stripe is not configured. Payment features will be disabled.');
}

// Initialize Stripe client (or null if not configured)
export const stripe = isStripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

/**
 * Check if Stripe is enabled
 */
export function isStripeEnabled(): boolean {
  return stripe !== null;
}

/**
 * Require Stripe to be configured
 */
export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
  }
  return stripe;
}
