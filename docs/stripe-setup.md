# Stripe Integration Guide

## Overview

This app includes a **placeholder** for Stripe subscription payments. The infrastructure is ready, but requires Stripe API keys and webhook configuration to go live.

## Current Status

✅ **Implemented:**

- Database schema for subscriptions
- Stripe client setup
- Webhook endpoint structure
- Subscription management UI placeholders

⏳ **Requires Configuration:**

- Stripe API keys
- Webhook secret
- Product/Price IDs
- Checkout session implementation

## Getting Started

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" or "Start now"
3. Complete account setup
4. Verify your email

### 2. Get API Keys

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. You'll find:
   - **Publishable key**: Used in frontend (safe to expose)
   - **Secret key**: Used in backend (keep secure)
   - **Test keys**: For development
   - **Live keys**: For production

### 3. Add to Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_BASIC=price_basic_monthly
STRIPE_PRICE_ID_PRO=price_pro_monthly
STRIPE_PRICE_ID_PREMIUM=price_premium_monthly
```

## Setting Up Products

### 1. Create Products in Stripe Dashboard

1. Go to **Products** → **Add product**
2. Create three subscription tiers:

#### Basic Plan

- **Name**: Basic
- **Description**: Essential features for fitness tracking
- **Price**: $9.99/month
- **Features**:
  - Basic health tracking
  - Manual workout logging
  - 1 device integration
  - Email support

#### Pro Plan (Recommended)

- **Name**: Pro
- **Description**: Advanced features for serious athletes
- **Price**: $19.99/month
- **Features**:
  - All Basic features
  - AI-powered recommendations
  - Unlimited device integrations
  - Advanced analytics
  - Priority support

#### Premium Plan

- **Name**: Premium
- **Description**: Complete package with trainer access
- **Price**: $39.99/month
- **Features**:
  - All Pro features
  - 1-on-1 trainer matching
  - Personalized training plans
  - Video consultations
  - 24/7 support

### 2. Get Price IDs

After creating products:

1. Click on each product
2. Copy the **Price ID** (starts with `price_`)
3. Add to your `.env` file

## Webhook Setup

### 1. Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### 2. Get Webhook Secret

After creating the webhook:

1. Click on the webhook endpoint
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Implementation Guide

### Step 1: Install Stripe (Already Done)

```bash
pnpm add stripe @stripe/stripe-js
```

### Step 2: Create Stripe Client

File: `src/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
```

### Step 3: Create Checkout Session

File: `src/app/api/stripe/checkout/route.ts`

```typescript
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
  const { userId, email } = await requireAuth();
  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
  });

  return Response.json({ url: session.url });
}
```

### Step 4: Handle Webhooks

File: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancel(deletedSub);
      break;
  }

  return Response.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id!;
  const subscriptionId = session.subscription as string;

  await db.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      status: 'ACTIVE',
      plan: 'PRO', // Determine from price ID
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}
```

### Step 5: Create Subscription UI

File: `src/components/subscription-plans.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SubscriptionPlans() {
  const handleSubscribe = async (priceId: string) => {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <h3>Basic</h3>
        <p>$9.99/month</p>
        <Button onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC!)}>
          Subscribe
        </Button>
      </Card>
      {/* Add Pro and Premium cards */}
    </div>
  );
}
```

## Testing

### Test Mode

Stripe provides test mode for development:

1. Use **test API keys** (start with `sk_test_` and `pk_test_`)
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
3. Use any future expiry date and any CVC

### Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures** before processing
3. **Use HTTPS** in production
4. **Validate price IDs** server-side
5. **Log all payment events** for auditing
6. **Handle failed payments** gracefully
7. **Provide clear cancellation** options

## Going Live

### Checklist

- [ ] Activate Stripe account (complete business verification)
- [ ] Switch to live API keys
- [ ] Create live products and prices
- [ ] Set up live webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Update terms of service and privacy policy
- [ ] Set up tax collection (if required)
- [ ] Configure email receipts
- [ ] Set up customer portal for subscription management

### Activation

1. Go to **Settings** → **Account**
2. Complete **Business details**
3. Add **Bank account** for payouts
4. Submit for review
5. Wait for approval (usually 1-2 days)

## Pricing

Stripe charges:

- **2.9% + $0.30** per successful card charge
- **0.5%** for subscriptions (additional)
- No monthly fees
- No setup fees

## Support

- **Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Support**: [https://support.stripe.com](https://support.stripe.com)
- **Status**: [https://status.stripe.com](https://status.stripe.com)

## Next Steps

1. ✅ Read this guide
2. ⏳ Create Stripe account
3. ⏳ Get API keys
4. ⏳ Create products
5. ⏳ Set up webhooks
6. ⏳ Implement checkout flow
7. ⏳ Test with test cards
8. ⏳ Go live!
