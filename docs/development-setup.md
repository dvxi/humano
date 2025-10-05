# 🛠️ Development Setup Guide

## Quick Start (No Email Setup Required)

The app is configured to work in development mode without email service setup. Magic links will be logged to your terminal console.

### 1. Start the Development Server

```bash
pnpm dev
```

### 2. Sign Up / Sign In

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Enter your email address
4. Click "Send Magic Link"
5. **Check your terminal** - you'll see output like:

```
Magic link for user@example.com: http://localhost:3000/api/auth/callback/email?token=...&email=...
```

6. Copy the entire URL and paste it into your browser
7. Complete the onboarding flow
8. Access your dashboard!

---

## Optional: Email Setup with Resend

If you want actual emails to be sent (recommended for production):

### 1. Get a Resend API Key

1. Go to https://resend.com
2. Sign up for a free account
3. Create an API key at https://resend.com/api-keys
4. Copy your API key (starts with `re_`)

### 2. Add to `.env`

```bash
# Uncomment and add your key
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Verify Domain (Production Only)

For production, you'll need to verify your domain in Resend:

- Go to https://resend.com/domains
- Add your domain
- Add the DNS records they provide
- Wait for verification

---

## OAuth Setup (Optional)

### Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

Add to `.env`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and generate Client Secret

Add to `.env`:

```bash
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

---

## Testing Authentication

### Test Magic Link Flow

```bash
# 1. Start dev server
pnpm dev

# 2. In another terminal, watch logs
# The magic link will appear here

# 3. Sign up with test email
# Use any email like: test@example.com

# 4. Copy the magic link from terminal
# Paste into browser

# 5. Complete onboarding
```

### Test OAuth Flow

Once you've configured Google or GitHub OAuth:

1. Go to sign-in page
2. Click "Google" or "GitHub" button
3. Authorize the app
4. Complete onboarding

---

## Environment Variables Reference

### Required (Already Set)

```bash
DATABASE_URL=postgresql://...          # ✅ Already configured
NEXTAUTH_URL=http://localhost:3000    # ✅ Already configured
NEXTAUTH_SECRET=...                    # ✅ Already configured
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ✅ Already configured
```

### Optional (For Full Functionality)

```bash
# Email
RESEND_API_KEY=re_...                 # For sending actual emails
EMAIL_FROM=noreply@yourdomain.com     # From address

# OAuth
GOOGLE_CLIENT_ID=...                  # Google sign-in
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...                         # GitHub sign-in
GITHUB_SECRET=...

# Integrations (for later)
VITAL_API_KEY=...                     # Health data integration
TERRA_API_KEY=...
POLAR_CLIENT_ID=...
GOOGLE_FIT_CLIENT_ID=...

# AI (for later)
OPENAI_API_KEY=sk-...                 # AI recommendations

# Payments (for later)
STRIPE_SECRET_KEY=sk_test_...         # Stripe payments
```

---

## Troubleshooting

### Magic Link Not Appearing in Console

**Problem**: You don't see the magic link in the terminal

**Solution**:

1. Make sure you're looking at the terminal where `pnpm dev` is running
2. Look for a line starting with "Magic link for"
3. If you see "Resend not configured" - that's expected!
4. The URL will be on the next line

### "Invalid Credentials" Error

**Problem**: The magic link doesn't work

**Solution**:

1. Make sure you copied the **entire URL** including the token
2. Magic links expire after 24 hours - request a new one
3. Make sure `NEXTAUTH_URL` matches your app URL

### OAuth Redirect Error

**Problem**: OAuth returns an error after authorization

**Solution**:

1. Check that your redirect URIs match exactly in the OAuth provider settings
2. For local development: `http://localhost:3000/api/auth/callback/[provider]`
3. Make sure the OAuth provider is enabled in your `.env`

### Database Connection Error

**Problem**: Can't connect to database

**Solution**:

1. Check that `DATABASE_URL` is set correctly in `.env`
2. Make sure your Neon database is active
3. Try: `pnpm db:push` to sync the schema

---

## Development Workflow

### Daily Development

```bash
# Start dev server
pnpm dev

# In another terminal - run tests
pnpm test

# Check types
pnpm typecheck

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database Changes

```bash
# After modifying prisma/schema.prisma
pnpm db:push          # Push changes to database
pnpm db:generate      # Regenerate Prisma client

# View database in browser
pnpm db:studio
```

### Testing

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# All checks (before committing)
pnpm verify
```

---

## Next Steps

1. ✅ Authentication is working (with console magic links)
2. ✅ Database is connected
3. ✅ Dashboard is accessible

**Optional Enhancements**:

- Set up Resend for actual emails
- Configure Google/GitHub OAuth
- Add more features (see `docs/implementation-plan.md`)

---

## Support

- **Documentation**: See `/docs` folder
- **API Reference**: `docs/api.md`
- **Architecture**: `docs/architecture.md`
- **Progress**: `PROGRESS.md`

---

**Last Updated**: October 5, 2025
