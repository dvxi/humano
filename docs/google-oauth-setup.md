# Google OAuth 2.0 Setup Guide

## Overview

This guide walks you through setting up Google Sign-In for your fitness app using Google Cloud Platform (GCP) OAuth 2.0.

## Prerequisites

- Google Account
- Your app deployed at: `https://humano-seven.vercel.app`

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project details:
   - **Project name**: `Fitness App` (or your preferred name)
   - **Organization**: Leave as default or select your org
4. Click **Create**
5. Wait for project creation (takes ~30 seconds)

### 2. Enable Google+ API (Required for OAuth)

1. In the Google Cloud Console, ensure your new project is selected
2. Go to **APIs & Services** → **Library**
3. Search for "Google+ API"
4. Click on **Google+ API**
5. Click **Enable**

**Note**: Even though Google+ is deprecated, the API is still required for OAuth user info.

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **User Type**:
   - **External** (for public app - anyone with Google account)
   - **Internal** (only for Google Workspace users in your org)
   - For your fitness app, choose **External**
3. Click **Create**

#### App Information

Fill in the required fields:

**App name**: `Fitness & Wellbeing` (or your app name)

**User support email**: Your email address

**App logo** (optional): Upload your app logo (120x120px minimum)

**Application home page**: `https://humano-seven.vercel.app`

**Application privacy policy link**: `https://humano-seven.vercel.app/privacy` (create this page)

**Application terms of service link**: `https://humano-seven.vercel.app/terms` (create this page)

**Authorized domains**:

- Add: `vercel.app`
- Add: `humano-seven.vercel.app` (if using custom domain)

**Developer contact information**: Your email address

Click **Save and Continue**

#### Scopes

1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `openid`
   - `email`
   - `profile`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Click **Update**
4. Click **Save and Continue**

#### Test Users (for External apps in testing)

If your app is in "Testing" mode:

1. Click **Add Users**
2. Add email addresses of users who can test the app
3. Click **Save and Continue**

**Note**: In testing mode, only these users can sign in. To allow anyone, you'll need to publish the app later.

#### Summary

Review your settings and click **Back to Dashboard**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. Enter **Name**: `Fitness App Web Client`

#### Configure Web Application

**Authorized JavaScript origins**:

```
https://humano-seven.vercel.app
```

**Authorized redirect URIs**:

```
https://humano-seven.vercel.app/api/auth/callback/google
```

**Important**:

- Use `https://` (not `http://`)
- No trailing slashes
- Exact match required

5. Click **Create**

### 5. Get Your Credentials

After creation, a dialog will show your credentials:

- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123def456`

**Important**: Copy these immediately! You'll need them for your app.

### 6. Add Credentials to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `humano-seven`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

5. Make sure they're set for:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

6. Click **Save**

### 7. Redeploy Your App

After adding environment variables:

1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger deployment

### 8. Test the Integration

1. Go to `https://humano-seven.vercel.app`
2. Click **Sign In**
3. Click **Continue with Google**
4. You should see Google's OAuth consent screen
5. Select your Google account
6. Grant permissions
7. You should be redirected back and logged in

## Common Issues & Solutions

### Issue 1: "Error 400: redirect_uri_mismatch"

**Cause**: The redirect URI doesn't match what's configured in GCP.

**Solution**:

1. Check the error message for the actual redirect URI being used
2. Go to GCP Console → Credentials
3. Edit your OAuth client
4. Add the exact URI shown in the error
5. Common mistake: Missing `/api/auth/callback/google` path

### Issue 2: "Access blocked: This app's request is invalid"

**Cause**: Missing or incorrect authorized domain.

**Solution**:

1. Go to OAuth consent screen
2. Add `vercel.app` to Authorized domains
3. Save changes
4. Wait 5-10 minutes for changes to propagate

### Issue 3: "This app isn't verified"

**Cause**: Your app is in testing mode or not verified by Google.

**For Development/Testing**:

- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for apps in development

**For Production**:

- You'll need to submit for Google verification
- Go to OAuth consent screen → "Publish App"
- Follow verification process (can take weeks)

### Issue 4: "Access blocked: Authorization Error"

**Cause**: User's email not in test users list (if app is in testing mode).

**Solution**:

1. Go to OAuth consent screen → Test users
2. Add the user's email address
3. Or publish the app to production

### Issue 5: Sign-in works but user not logged in

**Cause**: Missing `NEXTAUTH_URL` or `NEXTAUTH_SECRET` in Vercel.

**Solution**:

```env
NEXTAUTH_URL=https://humano-seven.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

## Local Development Setup

For testing locally:

### 1. Add localhost to OAuth client

In GCP Console → Credentials → Edit OAuth client:

**Authorized JavaScript origins**:

```
http://localhost:3000
```

**Authorized redirect URIs**:

```
http://localhost:3000/api/auth/callback/google
```

### 2. Add to local `.env`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
```

### 3. Run locally

```bash
pnpm dev
```

Visit `http://localhost:3000` and test Google sign-in.

## Publishing Your App

When ready for production (allowing anyone to sign in):

### 1. Complete OAuth Consent Screen

Ensure all required fields are filled:

- App name
- User support email
- Developer contact
- Privacy policy URL
- Terms of service URL

### 2. Add Required Scopes

Only request scopes you actually need:

- `openid`
- `email`
- `profile`

### 3. Submit for Verification (if needed)

If you're requesting sensitive scopes:

1. Go to OAuth consent screen
2. Click **Publish App**
3. Click **Prepare for Verification**
4. Follow the verification process

**Note**: For basic scopes (email, profile), you can publish without verification, but users will see an "unverified app" warning.

### 4. Publish App

1. Go to OAuth consent screen
2. Click **Publish App**
3. Confirm publication
4. App is now available to all Google users

## Security Best Practices

### 1. Protect Your Credentials

- ❌ Never commit credentials to Git
- ❌ Never expose Client Secret in frontend code
- ✅ Store in environment variables only
- ✅ Use different credentials for dev/prod

### 2. Limit Scopes

Only request the minimum scopes needed:

- `openid` - Required for OAuth
- `email` - User's email
- `profile` - User's name and picture

### 3. Verify Emails

In your app, verify that emails are legitimate:

- Check `email_verified` claim
- Validate email domain if needed

### 4. Rotate Secrets

Periodically rotate your Client Secret:

1. Create new secret in GCP Console
2. Update Vercel environment variables
3. Delete old secret after deployment

## Monitoring & Analytics

### View OAuth Usage

1. Go to GCP Console → APIs & Services → Credentials
2. Click on your OAuth client
3. View usage statistics

### Check Errors

1. Go to GCP Console → APIs & Services → Dashboard
2. View API usage and errors
3. Monitor for unusual activity

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] OAuth client created in GCP
- [ ] Correct redirect URI: `https://humano-seven.vercel.app/api/auth/callback/google`
- [ ] Authorized domain added: `vercel.app`
- [ ] `GOOGLE_CLIENT_ID` set in Vercel
- [ ] `GOOGLE_CLIENT_SECRET` set in Vercel
- [ ] `NEXTAUTH_URL` set to `https://humano-seven.vercel.app`
- [ ] `NEXTAUTH_SECRET` set in Vercel
- [ ] App redeployed after adding env vars
- [ ] If testing mode: Your email added to test users
- [ ] Database accessible and migrations applied

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check browser console for errors
4. Enable NextAuth debug mode: `NEXTAUTH_DEBUG=true`

## Summary

**Quick Setup Checklist**:

1. ✅ Create GCP project
2. ✅ Enable Google+ API
3. ✅ Configure OAuth consent screen
4. ✅ Create OAuth 2.0 credentials
5. ✅ Add redirect URI: `https://humano-seven.vercel.app/api/auth/callback/google`
6. ✅ Add credentials to Vercel environment variables
7. ✅ Redeploy app
8. ✅ Test sign-in

Your Google OAuth integration should now be working! 🎉
