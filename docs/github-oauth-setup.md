# GitHub OAuth Setup & Troubleshooting Guide

## Quick Checklist

If GitHub login isn't working, verify these in order:

### 1. GitHub OAuth App Configuration

Go to [github.com/settings/developers](https://github.com/settings/developers):

**Required Settings:**

- **Homepage URL**: `https://humano-seven.vercel.app`
- **Authorization callback URL**: `https://humano-seven.vercel.app/api/auth/callback/github`

**Common Mistakes:**

- ❌ Using `http://` instead of `https://`
- ❌ Adding trailing slashes
- ❌ Wrong callback path
- ❌ Typo in domain name

### 2. Vercel Environment Variables

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Required Variables:**

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=https://humano-seven.vercel.app
NEXTAUTH_SECRET=your_generated_secret
DATABASE_URL=your_postgres_connection_string
```

**Critical**: After adding/updating environment variables, you MUST redeploy!

### 3. Redeploy After Changes

Environment variable changes require a new deployment:

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Step-by-Step Setup

### 1. Create GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:

**Application name**: `Fitness & Wellbeing` (or your app name)

**Homepage URL**:

```
https://humano-seven.vercel.app
```

**Application description** (optional):

```
Fitness tracking app with AI-powered recommendations
```

**Authorization callback URL**:

```
https://humano-seven.vercel.app/api/auth/callback/github
```

4. Click **Register application**

### 2. Get Your Credentials

After creating the app:

1. You'll see your **Client ID** (something like `Iv1.abc123def456`)
2. Click **Generate a new client secret**
3. Copy the **Client Secret** immediately (you can't see it again!)

### 3. Add to Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
GITHUB_ID=Iv1.your_client_id_here
GITHUB_SECRET=your_secret_here
```

Make sure they're enabled for:

- ✅ Production
- ✅ Preview (optional)
- ✅ Development (optional)

### 4. Ensure NEXTAUTH Variables Are Set

Also verify these are set:

```env
NEXTAUTH_URL=https://humano-seven.vercel.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 5. Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **...** → **Redeploy**
4. Wait for deployment to complete

### 6. Test

1. Go to `https://humano-seven.vercel.app`
2. Click **Sign In**
3. Click **Continue with GitHub**
4. Authorize the app
5. You should be redirected back and logged in

## Common Issues & Solutions

### Issue 1: Redirected Back to Sign-In Page (Not Logged In)

**Symptoms**: GitHub authorization works, but you're redirected to sign-in page without being logged in.

**Causes & Solutions:**

#### A. Missing NEXTAUTH_URL

```env
# Add to Vercel:
NEXTAUTH_URL=https://humano-seven.vercel.app
```

#### B. Missing NEXTAUTH_SECRET

```bash
# Generate:
openssl rand -base64 32

# Add to Vercel:
NEXTAUTH_SECRET=<generated-value>
```

#### C. Environment Variables Not Applied

- Redeploy after adding variables
- Check they're set for "Production" environment

#### D. Database Connection Issue

- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Ensure Prisma migrations are applied

### Issue 2: "The redirect_uri MUST match the registered callback URL"

**Cause**: Callback URL mismatch in GitHub OAuth App settings.

**Solution**:

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click on your OAuth App
3. Verify **Authorization callback URL** is exactly:
   ```
   https://humano-seven.vercel.app/api/auth/callback/github
   ```
4. Click **Update application**

### Issue 3: "Bad verification code"

**Causes**:

- Old client secret being used
- Environment variables not updated after regenerating secret
- Deployment using cached environment variables

**Solution**:

1. Regenerate client secret in GitHub
2. Update `GITHUB_SECRET` in Vercel
3. Redeploy (don't just restart)

### Issue 4: Works Locally But Not on Vercel

**Checklist**:

- [ ] Environment variables set in Vercel (not just locally)
- [ ] `NEXTAUTH_URL` points to production URL (not localhost)
- [ ] GitHub OAuth App has production callback URL
- [ ] Redeployed after adding environment variables
- [ ] Using production database (not local)

### Issue 5: "Application suspended"

**Cause**: GitHub detected suspicious activity or policy violation.

**Solution**:

1. Check your GitHub email for notifications
2. Follow GitHub's instructions to restore app
3. May need to verify your account

## Debugging Steps

### 1. Enable Debug Mode

Add to Vercel environment variables:

```env
NEXTAUTH_DEBUG=true
```

Redeploy and check Vercel logs after attempting sign-in.

### 2. Check Vercel Logs

1. Go to your project in Vercel
2. Click on latest deployment
3. Go to **Functions** tab
4. Look for `/api/auth/[...nextauth]` function
5. Check logs for errors

### 3. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Attempt to sign in
4. Look for errors or failed requests

### 4. Verify Database Connection

Check if sessions are being created:

```bash
# Connect to your database
psql $DATABASE_URL

# Check sessions table
SELECT * FROM "Session" ORDER BY "expires" DESC LIMIT 5;

# Check users table
SELECT id, email, name, role FROM "User" ORDER BY "createdAt" DESC LIMIT 5;
```

### 5. Test Callback Manually

Visit this URL (replace with your Client ID):

```
https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://humano-seven.vercel.app/api/auth/callback/github&scope=user:email
```

This should redirect to GitHub, then back to your app.

## Local Development Setup

For testing locally:

### 1. Create Separate GitHub OAuth App

Create a second OAuth App for local development:

**Homepage URL**: `http://localhost:3000`

**Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### 2. Add to Local .env

```env
GITHUB_ID=your_local_app_client_id
GITHUB_SECRET=your_local_app_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-min-32-chars
DATABASE_URL=your_local_or_dev_database
```

### 3. Run Locally

```bash
pnpm dev
```

Visit `http://localhost:3000` and test GitHub sign-in.

## Security Best Practices

### 1. Use Different Apps for Dev/Prod

- Create separate GitHub OAuth Apps for:
  - Local development (`localhost:3000`)
  - Production (`humano-seven.vercel.app`)
- This prevents leaking production credentials

### 2. Rotate Secrets Regularly

Every 3-6 months:

1. Generate new client secret in GitHub
2. Update Vercel environment variables
3. Redeploy

### 3. Monitor OAuth App Usage

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click on your OAuth App
3. Review authorized users
4. Revoke suspicious authorizations

### 4. Limit Scope

Only request necessary scopes:

- `user:email` - User's email (default)
- `read:user` - User's profile (default)

Don't request more than needed.

## Verifying Everything Is Set Up Correctly

Run this checklist:

### GitHub OAuth App

- [ ] App created at github.com/settings/developers
- [ ] Homepage URL: `https://humano-seven.vercel.app`
- [ ] Callback URL: `https://humano-seven.vercel.app/api/auth/callback/github`
- [ ] No trailing slashes
- [ ] Using `https://` (not `http://`)

### Vercel Environment Variables

- [ ] `GITHUB_ID` set
- [ ] `GITHUB_SECRET` set
- [ ] `NEXTAUTH_URL=https://humano-seven.vercel.app`
- [ ] `NEXTAUTH_SECRET` set (32+ characters)
- [ ] `DATABASE_URL` set and accessible
- [ ] All variables enabled for "Production"

### Deployment

- [ ] Redeployed after adding environment variables
- [ ] Build succeeded
- [ ] No errors in function logs

### Database

- [ ] Prisma migrations applied
- [ ] `User`, `Account`, `Session` tables exist
- [ ] Database accessible from Vercel

## Still Not Working?

If you've checked everything above and it still doesn't work:

### 1. Check Specific Error

Look at the URL you're redirected to. Does it have an error parameter?

```
https://humano-seven.vercel.app/auth/error?error=...
```

Common errors:

- `Configuration` - NextAuth configuration issue
- `AccessDenied` - User denied authorization
- `Verification` - Token/session verification failed
- `OAuthSignin` - Error starting OAuth flow
- `OAuthCallback` - Error in callback handler
- `OAuthCreateAccount` - Error creating user account
- `EmailCreateAccount` - Error creating email account
- `Callback` - Error in callback handler
- `OAuthAccountNotLinked` - Email already used with different provider
- `SessionRequired` - Session required but not found
- `Default` - Generic error

### 2. Check Vercel Function Logs

The most detailed errors will be in Vercel function logs:

1. Vercel Dashboard → Your Project
2. Click on latest deployment
3. Functions tab
4. Click on `/api/auth/[...nextauth]`
5. View real-time logs

### 3. Temporarily Enable Debug Mode

```env
NEXTAUTH_DEBUG=true
NODE_ENV=production
```

This will log detailed information about the OAuth flow.

### 4. Test Database Connection

Create a test API route to verify database works:

```typescript
// app/api/test-db/route.ts
import { db } from '@/lib/db';

export async function GET() {
  try {
    const userCount = await db.user.count();
    return Response.json({ ok: true, userCount });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
```

Visit: `https://humano-seven.vercel.app/api/test-db`

## Quick Fix Script

If you need to verify your setup, run this locally:

```bash
#!/bin/bash
echo "Checking GitHub OAuth Configuration..."
echo ""
echo "Environment Variables:"
echo "GITHUB_ID: ${GITHUB_ID:0:10}..."
echo "GITHUB_SECRET: ${GITHUB_SECRET:0:10}..."
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
echo ""
echo "Expected callback URL:"
echo "$NEXTAUTH_URL/api/auth/callback/github"
echo ""
echo "Make sure this matches your GitHub OAuth App settings!"
```

Save as `check-oauth.sh`, make executable (`chmod +x check-oauth.sh`), and run (`./check-oauth.sh`).

## Summary

**Most Common Issue**: Missing or incorrect `NEXTAUTH_URL` in Vercel environment variables.

**Quick Fix**:

1. Set `NEXTAUTH_URL=https://humano-seven.vercel.app` in Vercel
2. Set `NEXTAUTH_SECRET=<generated-secret>` in Vercel
3. Verify GitHub callback URL is `https://humano-seven.vercel.app/api/auth/callback/github`
4. Redeploy
5. Test

If following all steps above doesn't work, share the specific error message or behavior you're seeing!
