# Vercel OAuth Debugging Guide

## Current Issue: GitHub/Google Login Not Working on Vercel

If OAuth providers (GitHub, Google) are configured correctly but users are redirected back to the sign-in page without being logged in, follow this debugging guide.

## ✅ Verified Configuration

Based on your setup:

- ✅ GitHub OAuth App callback URL: `https://humano-seven.vercel.app/api/auth/callback/github`
- ✅ Google OAuth callback URL: `https://humano-seven.vercel.app/api/auth/callback/google`
- ✅ `NEXTAUTH_URL=https://humano-seven.vercel.app` on Vercel
- ✅ `NEXTAUTH_SECRET` is set on Vercel
- ✅ `GITHUB_ID` and `GITHUB_SECRET` are set on Vercel
- ✅ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set on Vercel

## 🔍 Debugging Steps

### Step 1: Enable Debug Logging

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   NEXTAUTH_DEBUG=true
   ```
3. Enable for **Production**
4. **Redeploy** (important!)

### Step 2: Check Vercel Function Logs

After enabling debug mode and redeploying:

1. Go to Vercel → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Find `/api/auth/[...nextauth]` function
5. Click on it to see logs
6. Try to sign in with GitHub/Google
7. Watch the logs in real-time

**Look for:**

- ✅ "User attempting sign in" - OAuth callback received
- ❌ Database connection errors
- ❌ Prisma client errors
- ❌ Session creation failures
- ❌ "NextAuth error" messages

### Step 3: Verify Database Connection

The most common issue is database connectivity from Vercel.

#### Check DATABASE_URL Format

Your `DATABASE_URL` should look like:

```
postgresql://user:password@host:5432/database?sslmode=require
```

For **Neon PostgreSQL**, it should be:

```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Important for Neon:**

- Use the **pooled connection string** (not direct)
- Ensure `?sslmode=require` is at the end
- Verify the endpoint is not suspended (Neon free tier suspends after inactivity)

#### Test Database Connection

Create a test API route:

```typescript
// src/app/api/test-db/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection
    const userCount = await db.user.count();

    // Test Account table (needed for OAuth)
    const accountCount = await db.account.count();

    // Test Session table (needed for login)
    const sessionCount = await db.session.count();

    return NextResponse.json({
      ok: true,
      userCount,
      accountCount,
      sessionCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
```

Visit: `https://humano-seven.vercel.app/api/test-db`

**Expected:** `{ ok: true, userCount: X, accountCount: X, sessionCount: X }`

**If you get an error:**

- Database is not accessible from Vercel
- `DATABASE_URL` is incorrect
- Database tables don't exist (migrations not applied)

### Step 4: Verify Prisma Schema is Deployed

Check that Prisma client is generated on Vercel:

1. Verify `package.json` has:

   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```

2. Check Vercel build logs for:

   ```
   Running "prisma generate"
   ✔ Generated Prisma Client
   ```

3. If not found, the Prisma client isn't being generated, causing runtime errors.

### Step 5: Check for Schema Mismatches

If you've updated the Prisma schema locally but not on the production database:

1. **Check if migrations are applied:**

   ```bash
   # Connect to your production database
   psql $DATABASE_URL

   # Check if tables exist
   \dt

   # Should show: User, Account, Session, VerificationToken, Profile, etc.
   ```

2. **Apply migrations to production:**

   ```bash
   # If using Prisma Migrate
   npx prisma migrate deploy

   # OR if using db push
   npx prisma db push
   ```

3. **Verify tables exist:**
   - `User` - Stores user data
   - `Account` - Stores OAuth provider accounts (CRITICAL for GitHub/Google login)
   - `Session` - Stores active sessions (CRITICAL for staying logged in)
   - `VerificationToken` - For email magic links

### Step 6: Common Issues & Solutions

#### Issue A: "User signed in successfully but redirected to sign-in page"

**Cause:** Session not being created in database.

**Solutions:**

1. Verify `Session` table exists
2. Check database connection from Vercel
3. Ensure `NEXTAUTH_URL` matches your production domain exactly
4. Check Vercel function logs for session creation errors

#### Issue B: "Database connection timeout"

**Cause:** Neon database suspended (free tier) or connection string incorrect.

**Solutions:**

1. **For Neon:** Wake up the database by visiting the Neon console
2. Use **pooled connection string** (not direct)
3. Add `?sslmode=require` to connection string
4. Check Neon project is not paused

#### Issue C: "Prisma Client not found"

**Cause:** Prisma client not generated during build.

**Solutions:**

1. Add `postinstall` script to `package.json`
2. Redeploy
3. Check build logs for "Generated Prisma Client"

#### Issue D: "User created but Account not linked"

**Cause:** `Account` table issue or OAuth provider not saving properly.

**Solutions:**

1. Check `Account` table exists
2. Verify `allowDangerousEmailAccountLinking: true` in provider config
3. Check Vercel logs for "Failed to create account" errors

### Step 7: Manual Database Inspection

Connect to your production database and check:

```sql
-- Check if users are being created
SELECT id, email, name, "emailVerified", role, "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check if OAuth accounts are being linked
SELECT id, "userId", provider, "providerAccountId", "createdAt"
FROM "Account"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check if sessions are being created
SELECT id, "userId", "sessionToken", expires
FROM "Session"
ORDER BY expires DESC
LIMIT 5;

-- Check for orphaned users (users without accounts)
SELECT u.id, u.email, u.name, COUNT(a.id) as account_count
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
GROUP BY u.id, u.email, u.name
HAVING COUNT(a.id) = 0;
```

**What to look for:**

- Are users being created when you try to sign in?
- Are accounts being linked to users?
- Are sessions being created?
- Are there users without any linked accounts?

## 🎯 Most Likely Issues (in order)

### 1. Database Connection Problem (80% of cases)

- Neon database suspended
- Wrong connection string
- Missing `?sslmode=require`
- Database not accessible from Vercel

**Fix:** Verify `DATABASE_URL` and test with `/api/test-db` endpoint.

### 2. Prisma Client Not Generated (10% of cases)

- Missing `postinstall` script
- Build failing silently

**Fix:** Add `postinstall: "prisma generate"` to `package.json` and redeploy.

### 3. Schema Not Deployed (5% of cases)

- Local schema doesn't match production database
- Missing tables

**Fix:** Run `npx prisma db push` or `npx prisma migrate deploy` against production database.

### 4. Environment Variables Not Applied (3% of cases)

- Added variables but didn't redeploy
- Variables set for wrong environment (Preview vs Production)

**Fix:** Verify variables are set for Production and redeploy.

### 5. OAuth App Configuration (2% of cases)

- Callback URL typo
- Using wrong credentials

**Fix:** Double-check GitHub/Google OAuth app settings.

## 🚀 Quick Fix Checklist

Run through this checklist:

- [ ] `NEXTAUTH_URL=https://humano-seven.vercel.app` (no trailing slash)
- [ ] `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] `GITHUB_ID` and `GITHUB_SECRET` are set
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] `DATABASE_URL` is correct and accessible
- [ ] All environment variables enabled for **Production**
- [ ] Redeployed after setting environment variables
- [ ] `postinstall: "prisma generate"` in `package.json`
- [ ] Build succeeded on Vercel
- [ ] Database tables exist (`User`, `Account`, `Session`)
- [ ] Database is not suspended (for Neon)
- [ ] OAuth callback URLs match exactly in GitHub/Google settings

## 📊 Debugging Workflow

```mermaid
graph TD
    A[OAuth Login Fails] --> B{Check Vercel Logs}
    B -->|No logs| C[Enable NEXTAUTH_DEBUG=true]
    B -->|Has logs| D{What error?}

    D -->|Database error| E[Check DATABASE_URL]
    D -->|Prisma error| F[Check postinstall script]
    D -->|No error, but no session| G[Check Session table]

    E --> H[Test /api/test-db]
    H -->|Fails| I[Fix database connection]
    H -->|Works| J[Check schema sync]

    F --> K[Add postinstall script]
    K --> L[Redeploy]

    G --> M[Inspect database manually]
    M --> N{Sessions being created?}
    N -->|No| O[Check Account table]
    N -->|Yes| P[Check cookie settings]

    I --> Q[Update DATABASE_URL]
    Q --> L

    J --> R[Run prisma db push]
    R --> L

    O --> S[Verify OAuth provider config]
    S --> L

    P --> T[Check NEXTAUTH_URL matches domain]
    T --> L

    L --> U[Test again]
```

## 🔧 Temporary Debug Endpoint

To help diagnose issues, deploy this endpoint:

```typescript
// src/app/api/debug/auth/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found',
      });
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        sessions: {
          select: {
            expires: true,
          },
          orderBy: {
            expires: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      authenticated: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      user: {
        id: user?.id,
        email: user?.email,
        accounts: user?.accounts,
        latestSession: user?.sessions[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

Visit: `https://humano-seven.vercel.app/api/debug/auth` (after signing in)

## 📝 What to Share When Asking for Help

If you're still stuck, provide:

1. **Vercel function logs** from `/api/auth/[...nextauth]` (with `NEXTAUTH_DEBUG=true`)
2. **Database test results** from `/api/test-db`
3. **Environment variables** (names only, not values):
   ```
   NEXTAUTH_URL: SET
   NEXTAUTH_SECRET: SET
   GITHUB_ID: SET
   GITHUB_SECRET: SET
   DATABASE_URL: SET
   ```
4. **Build logs** from Vercel (look for Prisma generation)
5. **Database table list** (from `\dt` in psql)
6. **Specific error message** from browser console or Vercel logs

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ You click "Continue with GitHub/Google"
2. ✅ You authorize on GitHub/Google
3. ✅ You're redirected back to your app
4. ✅ You see the dashboard (not sign-in page)
5. ✅ Refreshing the page keeps you logged in
6. ✅ Your name/email appears in the UI

## 🔐 Security Note

Remember to **disable debug mode** after fixing:

1. Remove `NEXTAUTH_DEBUG=true` from Vercel
2. Remove any debug endpoints (`/api/test-db`, `/api/debug/auth`)
3. Redeploy

Debug mode logs sensitive information that shouldn't be in production logs long-term.
