/**
 * Stripe Customer Portal API
 *
 * Create a portal session for subscription management
 *
 * TODO: Configure Stripe to enable this endpoint
 * @see /docs/stripe-setup.md
 */

import { NextRequest } from 'next/server';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { requireStripe, isStripeEnabled } from '@/lib/stripe';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(_request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Check if Stripe is configured
    if (!isStripeEnabled()) {
      return Response.json(
        {
          error: 'Payments are not configured',
          message: 'Stripe API keys are required. See /docs/stripe-setup.md',
        },
        { status: 503 }
      );
    }

    const stripe = requireStripe();

    // Get user's subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription?.stripeCustomerId) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    });

    logger.info({ userId }, 'Created Stripe portal session');

    return Response.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Failed to create portal session');
    return errorResponse(error);
  }
}
