# 🔌 Vital API Setup Guide

## What is Vital?

**Vital** is a unified health data API that aggregates data from 300+ wearables, lab providers, and health apps. Instead of integrating with each device separately (Apple Watch, Garmin, Oura, Whoop, etc.), you integrate once with Vital and get access to all of them.

### Why Use Vital?

- **One Integration**: Connect to 300+ devices with a single API
- **Normalized Data**: All health data comes in a consistent format
- **Real-time Webhooks**: Get instant updates when new data arrives
- **OAuth Flow**: Secure user authentication for each device
- **Sandbox Mode**: Test without real devices

### Supported Devices

- Apple Health (iPhone/Apple Watch)
- Garmin
- Oura Ring
- Whoop
- Polar
- Fitbit
- Google Fit
- Strava
- Peloton
- And 290+ more...

---

## How to Get Vital API Keys

### Step 1: Sign Up for Vital

1. Go to https://app.tryvital.io/signup
2. Create an account (free sandbox available)
3. Verify your email

### Step 2: Create a Team

1. After signing in, create a new team
2. Choose a team name (e.g., "Fitness App Dev")
3. Select your region (EU or US)

### Step 3: Get API Keys

1. Navigate to **Settings** → **API Keys**
2. You'll see:
   - **API Key** (starts with `sk_...`)
   - **API Secret** (starts with `sks_...`)
   - **Webhook Secret** (starts with `whsec_...`)

3. Copy these values to your `.env` file:

```bash
VITAL_API_KEY=sk_eu_abc123...
VITAL_API_SECRET=sks_eu_xyz789...
VITAL_WEBHOOK_SECRET=whsec_abc123...
VITAL_ENVIRONMENT=sandbox  # or 'production'
```

### Step 4: Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Add your webhook URL:

   ```
   https://your-domain.com/api/webhooks/vital
   ```

   For local development, use ngrok:

   ```
   https://abc123.ngrok.io/api/webhooks/vital
   ```

3. Select events to receive:
   - `daily.data.sleep.created`
   - `daily.data.activity.created`
   - `daily.data.body.created`
   - `daily.data.workout.created`
   - `timeseries.data.created`

4. Save the webhook configuration

---

## Vital Data Types

### 1. Sleep Data

```typescript
{
  user_id: "user_123",
  date: "2025-10-05",
  sleep: {
    duration: 28800,  // seconds
    efficiency: 0.92,  // 92%
    hrv: {
      avg_hrv_rmssd: 65.5  // ms
    },
    heart_rate: {
      avg_hr_bpm: 58  // bpm
    },
    stages: {
      deep: 7200,
      rem: 5400,
      light: 14400,
      awake: 1800
    }
  }
}
```

### 2. Activity Data

```typescript
{
  user_id: "user_123",
  date: "2025-10-05",
  activity: {
    steps: 8543,
    distance_meters: 6234,
    calories_total: 2456,
    active_duration: 3600
  }
}
```

### 3. Workout Data

```typescript
{
  user_id: "user_123",
  workout: {
    id: "workout_123",
    sport: "strength_training",
    start: "2025-10-05T10:00:00Z",
    end: "2025-10-05T11:00:00Z",
    duration: 3600,
    calories: 456,
    distance: null,
    heart_rate: {
      avg_bpm: 120,
      max_bpm: 165
    }
  }
}
```

### 4. Body Metrics

```typescript
{
  user_id: "user_123",
  date: "2025-10-05",
  body: {
    weight_kg: 75.5,
    body_fat_percentage: 15.2,
    bmi: 23.4
  }
}
```

---

## Integration Flow

### 1. User Connects Device

```typescript
// Frontend: Initiate OAuth
const response = await fetch('/api/integrations/vital/connect', {
  method: 'POST',
  body: JSON.stringify({ provider: 'garmin' }),
});

const { link_url } = await response.json();
window.location.href = link_url; // Redirect to Vital OAuth
```

### 2. User Authorizes

- User is redirected to Vital's OAuth page
- They log in to their device account (e.g., Garmin)
- They authorize data sharing
- Vital redirects back to your callback URL

### 3. Webhook Receives Data

```typescript
// Backend: /api/webhooks/vital
export async function POST(req: Request) {
  // 1. Verify signature
  const signature = req.headers.get('x-vital-signature');
  const isValid = verifyVitalSignature(body, signature);

  // 2. Parse webhook payload
  const { event_type, user_id, data } = await req.json();

  // 3. Normalize and store data
  if (event_type === 'daily.data.sleep.created') {
    await storeMetric({
      userId: user_id,
      type: 'HRV',
      value: data.sleep.hrv.avg_hrv_rmssd,
      unit: 'ms',
      timestamp: new Date(data.date),
    });
  }

  return new Response('OK', { status: 200 });
}
```

---

## Testing with Sandbox

### Sandbox Mode Features

- Test without real devices
- Generate sample data via API
- Simulate webhook events
- Free to use

### Generate Test Data

```bash
curl -X POST https://api.tryvital.io/v2/sandbox/data \
  -H "x-vital-api-key: sk_eu_..." \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "provider": "garmin",
    "data_type": "sleep",
    "date": "2025-10-05"
  }'
```

---

## Pricing

### Free Tier

- **Sandbox**: Unlimited (for development)
- **Production**: First 100 connected users free

### Paid Plans

- **Starter**: $99/month (up to 500 users)
- **Growth**: $299/month (up to 2,000 users)
- **Scale**: Custom pricing (2,000+ users)

For a demo/MVP, the free tier is perfect!

---

## API Endpoints

### Connect User

```
POST https://api.tryvital.io/v2/link/token
```

### Get User Data

```
GET https://api.tryvital.io/v2/summary/sleep/{user_id}
GET https://api.tryvital.io/v2/summary/activity/{user_id}
GET https://api.tryvital.io/v2/summary/body/{user_id}
GET https://api.tryvital.io/v2/timeseries/workouts/{user_id}
```

### Disconnect User

```
DELETE https://api.tryvital.io/v2/user/{user_id}/provider/{provider}
```

---

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Always verify webhook signatures**
3. **Use HTTPS for webhook endpoints**
4. **Store tokens encrypted in database**
5. **Implement rate limiting on webhook endpoints**
6. **Log all webhook events for debugging**

---

## Troubleshooting

### Webhook Not Receiving Data

1. Check webhook URL is publicly accessible
2. Verify webhook secret matches
3. Check webhook event subscriptions
4. Look at Vital dashboard → Webhooks → Logs

### OAuth Flow Fails

1. Check redirect URL is whitelisted
2. Verify API keys are correct
3. Check user has device account
4. Look at browser console for errors

### Data Not Syncing

1. Check user has connected device
2. Verify device has recent data
3. Check webhook logs in Vital dashboard
4. Ensure user granted all permissions

---

## Useful Links

- **Dashboard**: https://app.tryvital.io
- **Documentation**: https://docs.tryvital.io
- **API Reference**: https://docs.tryvital.io/api-reference
- **Supported Devices**: https://docs.tryvital.io/wearables/providers
- **Webhooks Guide**: https://docs.tryvital.io/webhooks/introduction
- **Sandbox Testing**: https://docs.tryvital.io/sandbox/introduction

---

## Next Steps

1. ✅ Sign up for Vital account
2. ✅ Get API keys
3. ✅ Add keys to `.env` file
4. ⏳ Implement OAuth flow (we'll do this next)
5. ⏳ Create webhook handler
6. ⏳ Test with sandbox data

---

**Ready to integrate?** Let's implement the Vital integration in the next step!
