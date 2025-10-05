# 📋 Implementation Plan & Progress

## ✅ Phase 1: Authentication & Core Setup (COMPLETED)

### Completed Features

1. **NextAuth Integration**
   - ✅ Configured NextAuth with Prisma adapter
   - ✅ Email magic link provider (Resend)
   - ✅ Google OAuth provider
   - ✅ GitHub OAuth provider
   - ✅ Session management with database strategy
   - ✅ Type-safe session with role information

2. **Authentication UI**
   - ✅ Sign-in page (`/auth/signin`)
   - ✅ Sign-up page (`/auth/signup`)
   - ✅ Email verification page (`/auth/verify`)
   - ✅ Error page (`/auth/error`)
   - ✅ Beautiful, accessible forms with shadcn/ui

3. **Onboarding Flow**
   - ✅ Role selection (User/Trainer)
   - ✅ Profile questionnaire (age, sex, height, weight, location)
   - ✅ Subscription plan selection (Free/Monthly)
   - ✅ API endpoint for onboarding data submission
   - ✅ Automatic profile, subscription, and trainer record creation

4. **Dashboard**
   - ✅ Protected dashboard layout with navigation
   - ✅ Dashboard home page with metric cards
   - ✅ Real-time metric display (HRV, RHR, Sleep, Steps, Hydration)
   - ✅ Daily recommendation card (placeholder for AI)
   - ✅ Quick actions for logging data
   - ✅ User dropdown menu with profile/settings/signout

5. **Session Management**
   - ✅ `getCurrentUser()` helper
   - ✅ `requireAuth()` for protected routes
   - ✅ `requireRole()` for role-based access

### Files Created

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── onboarding/route.ts
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── verify/page.tsx
│   │   └── error/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── onboarding/page.tsx
│   └── page.tsx (landing)
├── components/
│   ├── dashboard-nav.tsx
│   ├── providers.tsx
│   └── ui/ (16 shadcn components)
├── lib/
│   ├── auth.ts
│   └── session.ts
└── types/
    └── next-auth.d.ts
```

---

## 🚧 Phase 2: Core Features (IN PROGRESS)

### Next Steps

#### 1. Profile & Settings Pages

- [ ] Profile management page
- [ ] Settings page with preferences
- [ ] Data export/deletion (GDPR)
- [ ] Profile edit forms

#### 2. Activity Logging

- [ ] Activity logging interface
- [ ] Exercise selection
- [ ] Set/rep/weight tracking
- [ ] RPE and duration logging
- [ ] Manual vs. watch-connected mode toggle

#### 3. Daily Reports

- [ ] Morning report form (mood, stress, soreness, sleep quality)
- [ ] Day report form (hydration, meals, steps, temp, pressure)
- [ ] Report submission API endpoints
- [ ] Reminder system

#### 4. History & Charts

- [ ] History page with date range selector
- [ ] Metric charts (Recharts)
- [ ] Trend analysis
- [ ] CSV export

---

## 🔌 Phase 3: Health Integrations

### Integration Architecture

```
src/integrations/
├── vital/
│   ├── client.ts       # Vital API client
│   ├── oauth.ts        # OAuth flow
│   ├── webhook.ts      # Webhook handler
│   └── mapper.ts       # Data normalization
├── terra/
│   ├── client.ts
│   ├── oauth.ts
│   ├── webhook.ts
│   └── mapper.ts
├── polar/
│   ├── client.ts
│   ├── oauth.ts
│   └── webhook.ts
└── googlefit/
    ├── client.ts
    ├── oauth.ts
    └── poller.ts       # Periodic polling
```

### Implementation Steps

#### 1. Vital Integration (Priority 1)

- [ ] Create Vital API client
- [ ] Implement OAuth connect flow
- [ ] Create webhook endpoint `/api/webhooks/vital`
- [ ] Implement signature verification
- [ ] Map Vital data to our `Metric` model
- [ ] Handle sleep, HRV, RHR, steps, workouts
- [ ] Test with sandbox environment

#### 2. Terra Integration (Priority 2)

- [ ] Create Terra API client
- [ ] Implement OAuth connect flow
- [ ] Create webhook endpoint `/api/webhooks/terra`
- [ ] Implement signature verification
- [ ] Map Terra data to our models
- [ ] Test with sandbox

#### 3. Polar AccessLink (Priority 3)

- [ ] Create Polar API client
- [ ] Implement OAuth flow
- [ ] Create webhook endpoint `/api/webhooks/polar`
- [ ] Handle activity data
- [ ] Test with Polar Flow account

#### 4. Google Fit (Priority 4)

- [ ] Create Google Fit API client
- [ ] Implement OAuth flow
- [ ] Create polling service (webhooks limited)
- [ ] Map fitness data to our models
- [ ] Test with Google account

#### 5. Integration UI

- [ ] Integrations management page
- [ ] Connect/disconnect buttons for each provider
- [ ] OAuth redirect handling
- [ ] Connection status indicators
- [ ] Last sync timestamps

---

## 🤖 Phase 4: AI Services

### AI Architecture

```
src/core/
├── services/
│   ├── recommendation.service.ts
│   ├── questionnaire.service.ts
│   └── chat.service.ts
└── ports/
    └── ai.port.ts
```

### Implementation Steps

#### 1. Recommendation Engine

- [ ] Create recommendation service
- [ ] Fetch last 7 days of metrics
- [ ] Calculate HRV trend
- [ ] Calculate RHR drift
- [ ] Analyze sleep regularity
- [ ] Assess training load
- [ ] Call OpenAI with structured prompt
- [ ] Return REST/EASY/MODERATE/HARD with rationale
- [ ] Cache recommendations (1 per day)

#### 2. Questionnaire Normalization

- [ ] Create questionnaire service
- [ ] Accept free-text input
- [ ] Call OpenAI to extract structured data
- [ ] Return normalized fields with confidence scores
- [ ] Show confirmation UI to user

#### 3. Chat Interface (Optional)

- [ ] Create chat service
- [ ] Ground responses in user metrics
- [ ] Implement conversation history
- [ ] Add safety guardrails

---

## 💳 Phase 5: Stripe Placeholder

### Placeholder Implementation

```typescript
// src/lib/stripe-placeholder.ts
/**
 * STRIPE INTEGRATION PLACEHOLDER
 *
 * To implement:
 * 1. Install: pnpm add stripe
 * 2. Add STRIPE_SECRET_KEY to .env
 * 3. Uncomment the code below
 * 4. Create webhook endpoint at /api/stripe/webhook
 * 5. Handle subscription.created, subscription.updated, subscription.deleted
 */

export async function createCheckoutSession(userId: string, plan: 'MONTHLY') {
  // TODO: Implement Stripe checkout
  console.log('Stripe checkout not implemented yet');
  return { url: '/dashboard?payment=pending' };
}

export async function createPortalSession(customerId: string) {
  // TODO: Implement Stripe portal
  console.log('Stripe portal not implemented yet');
  return { url: '/dashboard/settings' };
}
```

### UI Integration Points

- [ ] Add "Upgrade" button in dashboard
- [ ] Show subscription status in settings
- [ ] Add billing management link
- [ ] Display payment history

---

## 👥 Phase 6: Trainer Features

### Trainer Directory

- [ ] Trainer listing page
- [ ] Search and filters (location, price, specialization)
- [ ] Trainer profile cards
- [ ] Contact trainer functionality
- [ ] Map view (optional)

### Trainer Profile

- [ ] Trainer bio editor
- [ ] Price per session
- [ ] Availability calendar (optional)
- [ ] Client testimonials (optional)

---

## 🧪 Phase 7: Testing

### Test Coverage Goals

- Unit tests: 80% coverage
- Integration tests for all API endpoints
- E2E tests for critical flows

### Test Priorities

1. [ ] Authentication flow tests
2. [ ] Onboarding flow tests
3. [ ] Dashboard data fetching tests
4. [ ] Webhook processing tests
5. [ ] AI service tests (with mocked OpenAI)
6. [ ] Integration OAuth flow tests

---

## 📊 Phase 8: Analytics & Monitoring

### Observability

- [ ] Add request logging middleware
- [ ] Implement error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Create admin dashboard (optional)

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Seed data for demo
- [ ] Error boundaries in place
- [ ] Loading states implemented

### Deployment

- [ ] Deploy to Vercel/Railway/Render
- [ ] Set up production database (Neon/Supabase)
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Enable HTTPS
- [ ] Configure CORS

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify webhook endpoints
- [ ] Test OAuth flows
- [ ] Verify email delivery

---

## 📝 Current Status

**Phase 1: ✅ COMPLETE**

- Authentication system fully functional
- Onboarding flow complete
- Dashboard with real data display
- All core UI components installed

**Phase 2: 🟡 30% COMPLETE**

- Dashboard home page done
- Need: Profile, Activity logging, Reports, History

**Phase 3: 🔴 NOT STARTED**

- All integrations pending
- Need API credentials for testing

**Phase 4: 🔴 NOT STARTED**

- AI services pending
- Need OpenAI API key

**Phase 5: 🔴 NOT STARTED**

- Stripe placeholder needed

**Phase 6: 🔴 NOT STARTED**

- Trainer features pending

---

## 🎯 Next Session Goals

1. **Complete Profile & Settings** (1-2 hours)
   - Profile edit page
   - Settings page
   - Data export/deletion

2. **Activity Logging** (2-3 hours)
   - Activity form
   - Exercise database
   - Workout submission API

3. **Daily Reports** (1-2 hours)
   - Morning report form
   - Day report form
   - Report APIs

4. **Start Integrations** (3-4 hours)
   - Vital OAuth flow
   - Webhook endpoint
   - Data normalization

---

## 📚 Resources

### API Documentation

- **Vital**: https://docs.tryvital.io/
- **Terra**: https://docs.tryterra.co/
- **Polar**: https://www.polar.com/accesslink-api/
- **Google Fit**: https://developers.google.com/fit
- **OpenAI**: https://platform.openai.com/docs/
- **Stripe**: https://stripe.com/docs/api

### Testing Credentials

- Set up sandbox accounts for each integration
- Use test mode for Stripe
- Use development API keys

---

**Last Updated**: October 5, 2025
**Status**: Phase 1 Complete, Phase 2 In Progress
