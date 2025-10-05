# 🚀 Deployment Checklist

## ✅ Completed

- [x] Core application built and tested
- [x] Database schema created (Prisma + Neon PostgreSQL)
- [x] Authentication system (NextAuth + Resend)
- [x] Dashboard and UI components
- [x] Health integrations (Vital + Terra)
- [x] AI features (OpenAI)
- [x] Payment infrastructure (Stripe placeholder)
- [x] Vercel deployment configured
- [x] Build passing on Vercel

## 🔧 Required Configuration

### 1. Webhook URLs (After Deployment)

Once your app is deployed, configure these webhooks:

#### Vital Webhooks

1. Go to [Vital Dashboard](https://app.tryvital.io/) → Webhooks
2. Add webhook: `https://yourdomain.com/api/webhooks/vital`
3. Select events:
   - `workout.created`
   - `workout.updated`
   - `daily.data.sleep.created`
   - `daily.data.activity.created`
   - `daily.data.body.created`
4. Copy the webhook secret to `.env` as `VITAL_WEBHOOK_SECRET`

#### Terra Webhooks

1. Go to [Terra Dashboard](https://dashboard.tryterra.co/) → Webhooks
2. Add webhook: `https://yourdomain.com/api/webhooks/terra`
3. Select events:
   - `auth`
   - `deauth`
   - `activity`
   - `body`
   - `sleep`
   - `workout`
4. Copy the signing secret to `.env` as `TERRA_SIGNING_SECRET`

#### Stripe Webhooks (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 2. Environment Variables on Vercel

Make sure these are set in Vercel → Settings → Environment Variables:

#### Essential

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
RESEND_API_KEY=re_...
```

#### OAuth (At least one)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

#### Health Integration (At least one)

```
# Option 1: Vital
VITAL_API_KEY=...
VITAL_WEBHOOK_SECRET=...
VITAL_ENVIRONMENT=production

# Option 2: Terra
TERRA_DEV_ID=...
TERRA_API_KEY=...
TERRA_SIGNING_SECRET=...
```

#### AI Features (Recommended)

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

#### Payments (Optional)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3. Database Migrations

Run Prisma migrations on production:

```bash
# From Vercel CLI or in your deployment
pnpm prisma migrate deploy
```

Or use Prisma Studio to verify:

```bash
pnpm db:studio
```

## 🧪 Testing After Deployment

### 1. Health Check

```bash
curl https://yourdomain.com/api/health
```

Expected response:

```json
{
  "ok": true,
  "version": "0.1.0",
  "db": "connected"
}
```

### 2. Authentication Flow

1. Visit `https://yourdomain.com`
2. Click "Sign In"
3. Try email magic link
4. Try OAuth (Google/GitHub)
5. Complete onboarding
6. Verify redirect to dashboard

### 3. Device Connection

1. Go to Dashboard → Integrations
2. Click "Connect Vital" or "Connect Terra"
3. Complete OAuth flow
4. Verify connection status shows "Connected"

### 4. Webhook Testing

#### Test Vital Webhook

```bash
curl -X POST https://yourdomain.com/api/webhooks/vital \
  -H "Content-Type: application/json" \
  -H "x-vital-webhook-signature: test" \
  -d '{"event_type": "workout.created", "data": {...}}'
```

#### Test Terra Webhook

```bash
curl -X POST https://yourdomain.com/api/webhooks/terra \
  -H "Content-Type: application/json" \
  -H "terra-signature: test" \
  -d '{"type": "activity", "user": {...}}'
```

### 5. AI Recommendations

1. Log some workouts
2. Go to Dashboard
3. Verify AI recommendations appear
4. Check for personalized insights

## 📊 Monitoring

### Vercel Analytics

- Enable in Vercel dashboard
- Monitor page views, performance, errors

### Database Monitoring

- Check Neon dashboard for query performance
- Monitor connection pool usage

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
pnpm add @sentry/nextjs
```

## 🔒 Security Checklist

- [ ] All environment variables are set
- [ ] Webhook signatures are verified
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] API keys are not exposed in frontend
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Rate limiting configured (TODO)

## 🎯 Post-Launch Tasks

### Immediate (First Day)

- [ ] Test all critical user flows
- [ ] Monitor error logs
- [ ] Verify webhook deliveries
- [ ] Test device connections
- [ ] Check AI recommendations

### Week 1

- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Fix any reported bugs
- [ ] Optimize slow queries
- [ ] Add more unit tests

### Month 1

- [ ] Implement Stripe payments
- [ ] Add Google Fit integration
- [ ] Improve AI recommendations
- [ ] Add push notifications
- [ ] Create mobile app

## 📞 Support Resources

### Documentation

- `/docs/architecture.md` - System architecture
- `/docs/api.md` - API documentation
- `/docs/vital-setup.md` - Vital integration
- `/docs/terra-setup.md` - Terra integration
- `/docs/stripe-setup.md` - Stripe payments
- `IMPLEMENTATION-STATUS.md` - Feature status

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vital API Docs](https://docs.tryvital.io/)
- [Terra API Docs](https://docs.tryterra.co/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Stripe Docs](https://stripe.com/docs)

### Troubleshooting

#### Build Fails

1. Check Vercel build logs
2. Verify all env vars are set
3. Run `pnpm build` locally
4. Check for TypeScript errors

#### Webhooks Not Working

1. Verify webhook URL is correct
2. Check webhook signature verification
3. Review webhook logs in provider dashboard
4. Test with curl commands above

#### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check Neon dashboard for connection limits
3. Run `pnpm prisma generate`
4. Verify migrations are applied

#### Authentication Issues

1. Check NEXTAUTH_URL matches deployment URL
2. Verify OAuth redirect URIs
3. Check Resend API key
4. Review NextAuth logs

## 🎉 You're Ready!

Your app is production-ready and deployed! 🚀

Next steps:

1. Configure webhooks (see above)
2. Test all features
3. Monitor for errors
4. Gather user feedback
5. Iterate and improve

Good luck! 💪
