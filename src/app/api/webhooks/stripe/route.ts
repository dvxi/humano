/**
 * Stripe Webhook Handler
 *
 * Process Stripe webhook events for subscription management
 *
 * Events:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription changed
 * - customer.subscription.deleted: Subscription canceled
 * - invoice.paid: Payment successful
 * - invoice.payment_failed: Payment failed
 *
 * TODO: Configure Stripe webhooks in dashboard
 * @see /docs/stripe-setup.md
 */

import { NextRequest } from 'next/server';
import { requireStripe, isStripeEnabled } from '@/lib/stripe';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id!;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  // Map plan string to SubscriptionPlan enum
  const planStr = session.metadata?.plan || 'MONTHLY';
  const plan = planStr === 'FREE_FINDER' ? 'FREE_FINDER' : 'MONTHLY';

  // Get subscription details from Stripe
  const stripe = requireStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Create subscription in database
  await db.subscription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      stripeSubId: subscriptionId,
      stripeCustomerId: customerId,
      status: 'ACTIVE',
      plan: plan as 'FREE_FINDER' | 'MONTHLY',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      stripeSubId: subscriptionId,
      stripeCustomerId: customerId,
      status: 'ACTIVE',
      plan: plan as 'FREE_FINDER' | 'MONTHLY',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  logger.info({ userId, subscriptionId, plan }, 'Subscription created');
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const existingSubscription = await db.subscription.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!existingSubscription) {
    logger.warn({ customerId }, 'Subscription not found for update');
    return;
  }

  // Update subscription
  await db.subscription.update({
    where: {
      id: existingSubscription.id,
    },
    data: {
      status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELED',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  logger.info(
    { subscriptionId: subscription.id, status: subscription.status },
    'Subscription updated'
  );
}

async function handleSubscriptionDelete(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const existingSubscription = await db.subscription.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!existingSubscription) {
    logger.warn({ customerId }, 'Subscription not found for deletion');
    return;
  }

  // Mark as canceled
  await db.subscription.update({
    where: {
      id: existingSubscription.id,
    },
    data: {
      status: 'CANCELED',
    },
  });

  logger.info({ subscriptionId: subscription.id }, 'Subscription canceled');
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeEnabled()) {
      return Response.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const stripe = requireStripe();

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe webhook signature');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      logger.error({ err }, 'Invalid Stripe webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    logger.info({ type: event.type }, 'Received Stripe webhook');

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDelete(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        logger.info({ invoice: event.data.object.id }, 'Invoice paid');
        break;

      case 'invoice.payment_failed':
        logger.warn({ invoice: event.data.object.id }, 'Invoice payment failed');
        break;

      default:
        logger.info({ type: event.type }, 'Unhandled Stripe webhook event');
    }

    return Response.json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Failed to process Stripe webhook');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
