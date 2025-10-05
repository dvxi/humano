# Terra API Integration Guide

## Overview

Terra is a unified API for wearables and fitness data. It provides a single integration point for connecting to multiple fitness devices and platforms including Fitbit, Garmin, Oura, Whoop, and more.

## Getting Started

### 1. Create a Terra Account

1. Go to [https://www.tryterra.co/](https://www.tryterra.co/)
2. Click "Get Started" or "Sign Up"
3. Create your account
4. Verify your email

### 2. Get API Credentials

1. Log in to the [Terra Dashboard](https://dashboard.tryterra.co/)
2. Navigate to **Settings** → **API Keys**
3. You'll find:
   - **Dev ID**: Your unique developer identifier
   - **API Key**: Your secret API key for authentication
   - **Signing Secret**: Used to verify webhook signatures

### 3. Add to Environment Variables

Add these to your `.env` file:

```env
# Terra API Configuration
TERRA_DEV_ID=your_dev_id_here
TERRA_API_KEY=your_api_key_here
TERRA_SIGNING_SECRET=your_signing_secret_here
```

## Terra Integration Features

### Supported Providers

Terra supports 30+ integrations including:

- **Wearables**: Fitbit, Garmin, Oura, Whoop, Apple Watch, Samsung Health
- **Fitness Apps**: Strava, Peloton, TrainingPeaks, Zwift
- **Health Platforms**: Google Fit, Apple Health, Freestyle Libre
- **Smart Scales**: Withings, Fitbit Aria

### Data Types

Terra provides access to:

1. **Activity Data**
   - Steps, distance, calories
   - Active minutes, heart rate zones
   - Workouts and exercise sessions

2. **Body Metrics**
   - Weight, BMI, body fat percentage
   - Heart rate, HRV, blood pressure
   - Temperature, oxygen saturation

3. **Sleep Data**
   - Sleep duration and stages
   - Sleep quality scores
   - REM, deep, and light sleep

4. **Nutrition**
   - Calorie intake
   - Macronutrients (protein, carbs, fat)
   - Micronutrients and hydration

5. **Workouts**
   - Exercise type and duration
   - Heart rate data
   - GPS routes and elevation

## Authentication Flow

### Widget Authentication (Recommended)

Terra provides a pre-built widget for user authentication:

```typescript
// 1. Generate authentication URL
const response = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
  method: 'POST',
  headers: {
    'dev-id': TERRA_DEV_ID,
    'x-api-key': TERRA_API_KEY,
  },
  body: JSON.stringify({
    reference_id: userId, // Your internal user ID
    providers: ['FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'STRAVA'],
    language: 'en',
  }),
});

const { url, session_id } = await response.json();

// 2. Redirect user to the widget URL
// User selects provider and authenticates
// Terra redirects back to your callback URL

// 3. Handle callback
// Terra will send a webhook when connection is successful
```

### Manual OAuth Flow

For custom implementations:

```typescript
// 1. Get authorization URL
const response = await fetch('https://api.tryterra.co/v2/auth/authenticateUser', {
  method: 'POST',
  headers: {
    'dev-id': TERRA_DEV_ID,
    'x-api-key': TERRA_API_KEY,
  },
  body: JSON.stringify({
    provider: 'FITBIT',
    reference_id: userId,
    redirect_uri: 'https://yourdomain.com/api/integrations/terra/callback',
  }),
});

const { auth_url } = await response.json();

// 2. Redirect user to auth_url
// 3. Handle callback with authorization code
// 4. Terra automatically completes the OAuth flow
```

## Webhooks

### Setting Up Webhooks

1. Go to [Terra Dashboard](https://dashboard.tryterra.co/)
2. Navigate to **Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL: `https://yourdomain.com/api/webhooks/terra`
5. Select event types to receive

### Webhook Events

Terra sends webhooks for various events:

#### Connection Events

- `auth` - User successfully connected
- `deauth` - User disconnected

#### Data Events

- `activity` - New activity data available
- `body` - New body metrics available
- `daily` - New daily summary available
- `sleep` - New sleep data available
- `nutrition` - New nutrition data available
- `workout` - New workout data available

### Webhook Payload Structure

```json
{
  "type": "activity",
  "user": {
    "user_id": "terra_user_id",
    "provider": "FITBIT",
    "reference_id": "your_user_id"
  },
  "data": [
    {
      "metadata": {
        "start_time": "2025-10-05T00:00:00Z",
        "end_time": "2025-10-05T23:59:59Z"
      },
      "active_durations_data": {
        "activity_seconds": 3600,
        "low_intensity_seconds": 1800,
        "moderate_intensity_seconds": 1200,
        "vigorous_intensity_seconds": 600
      },
      "distance_data": {
        "steps": 10000,
        "distance_meters": 8000
      },
      "calories_data": {
        "total_burned_calories": 2500,
        "active_calories": 800
      }
    }
  ]
}
```

### Verifying Webhook Signatures

Terra signs all webhooks with your signing secret:

```typescript
import crypto from 'crypto';

function verifyTerraSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

## API Endpoints

### Get User Data

```typescript
// Get activity data
const response = await fetch(
  `https://api.tryterra.co/v2/activity?user_id=${terraUserId}&start_date=2025-10-01&end_date=2025-10-05`,
  {
    headers: {
      'dev-id': TERRA_DEV_ID,
      'x-api-key': TERRA_API_KEY,
    },
  }
);

// Get body data
const response = await fetch(
  `https://api.tryterra.co/v2/body?user_id=${terraUserId}&start_date=2025-10-01&end_date=2025-10-05`,
  {
    headers: {
      'dev-id': TERRA_DEV_ID,
      'x-api-key': TERRA_API_KEY,
    },
  }
);

// Get sleep data
const response = await fetch(
  `https://api.tryterra.co/v2/sleep?user_id=${terraUserId}&start_date=2025-10-01&end_date=2025-10-05`,
  {
    headers: {
      'dev-id': TERRA_DEV_ID,
      'x-api-key': TERRA_API_KEY,
    },
  }
);
```

### Deauthenticate User

```typescript
const response = await fetch('https://api.tryterra.co/v2/auth/deauthenticateUser', {
  method: 'DELETE',
  headers: {
    'dev-id': TERRA_DEV_ID,
    'x-api-key': TERRA_API_KEY,
  },
  body: JSON.stringify({
    user_id: terraUserId,
  }),
});
```

## Rate Limits

- **Free Tier**: 100 requests/day
- **Starter**: 10,000 requests/month
- **Growth**: 100,000 requests/month
- **Enterprise**: Custom limits

## Best Practices

1. **Use Webhooks**: Don't poll for data; use webhooks for real-time updates
2. **Store Terra User IDs**: Map Terra user IDs to your internal user IDs
3. **Handle Deauth**: Listen for deauth webhooks and update your database
4. **Verify Signatures**: Always verify webhook signatures for security
5. **Batch Requests**: Request multiple days of data in a single API call
6. **Cache Data**: Store received data in your database to reduce API calls

## Testing

Terra provides a sandbox environment for testing:

1. Use the **Test Mode** toggle in the dashboard
2. Generate test data using the Terra dashboard
3. Test webhook delivery with sample payloads

## Support

- **Documentation**: [https://docs.tryterra.co/](https://docs.tryterra.co/)
- **API Reference**: [https://docs.tryterra.co/reference](https://docs.tryterra.co/reference)
- **Support**: support@tryterra.co
- **Community**: [Discord](https://discord.gg/terra)

## Pricing

- **Free**: 100 requests/day, 1 provider
- **Starter**: $49/month, 10k requests, all providers
- **Growth**: $199/month, 100k requests, all providers
- **Enterprise**: Custom pricing

## Next Steps

1. ✅ Create Terra account
2. ✅ Get API credentials
3. ✅ Add credentials to `.env`
4. ⏳ Implement OAuth flow in your app
5. ⏳ Set up webhook endpoint
6. ⏳ Test with a real device
7. ⏳ Go live!
