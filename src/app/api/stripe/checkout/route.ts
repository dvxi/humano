/**
 * Stripe Checkout Session API
 *
 * Create a checkout session for subscription purchase
 *
 * TODO: Configure Stripe to enable this endpoint
 * @see /docs/stripe-setup.md
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth, errorResponse } from '@/lib/api-auth';
import { requireStripe, isStripeEnabled } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await requireAuth();

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
    const body = await request.json();
    const { priceId, plan } = body;

    if (!priceId) {
      return Response.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email || undefined,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
      metadata: {
        userId,
        plan,
      },
    });

    logger.info({ userId, priceId, plan }, 'Created Stripe checkout session');

    return Response.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Failed to create checkout session');
    return errorResponse(error);
  }
}
