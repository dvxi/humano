# 🔌 API Documentation

## Health & Monitoring

### GET `/api/health`

Health check endpoint for monitoring service availability.

**Response:**

```json
{
  "ok": true,
  "version": "1.0.0",
  "timestamp": "2025-10-05T12:00:00.000Z",
  "db": "connected"
}
```

## Authentication

### POST `/api/auth/signin`

NextAuth sign-in endpoint (email magic link or OAuth).

### POST `/api/auth/signout`

Sign out current user.

### GET `/api/auth/session`

Get current user session.

## Webhooks

All webhook endpoints require signature verification.

### POST `/api/webhooks/vital`

Receive health data updates from Vital API.

**Headers:**

- `x-vital-signature`: Webhook signature for verification

**Payload:**

```json
{
  "event_type": "daily.data.sleep.created",
  "user_id": "user_123",
  "data": {
    "sleep": { ... }
  }
}
```

### POST `/api/webhooks/terra`

Receive health data updates from Terra API.

**Headers:**

- `terra-signature`: Webhook signature for verification

### POST `/api/webhooks/polar`

Receive activity data from Polar AccessLink.

**Headers:**

- `polar-webhook-signature`: Webhook signature for verification

### POST `/api/webhooks/googlefit`

Receive fitness data from Google Fit.

## AI Services

### POST `/api/ai/recommendation`

Get daily training recommendation based on recent metrics.

**Request:**

```json
{
  "userId": "user_123"
}
```

**Response:**

```json
{
  "recommendation": "MODERATE",
  "rationale": "Your HRV is trending up and sleep quality is good. A moderate intensity workout is recommended.",
  "metrics": {
    "hrv": 65,
    "rhr": 58,
    "sleepScore": 85
  }
}
```

### POST `/api/ai/normalize-questionnaire`

Normalize free-text questionnaire responses.

**Request:**

```json
{
  "text": "I'm a 30 year old male, 180cm tall, weigh 80kg, living in Warsaw"
}
```

**Response:**

```json
{
  "age": 30,
  "sex": "male",
  "heightCm": 180,
  "weightKg": 80,
  "location": "Warsaw",
  "confidence": 0.95
}
```

## Metrics & Logs

### POST `/api/logs/morning`

Submit morning report (mood, stress, soreness, sleep).

**Request:**

```json
{
  "mood": 4,
  "stress": 2,
  "soreness": 3,
  "sleepQuality": 4,
  "sleepHours": 7.5
}
```

### POST `/api/logs/day`

Submit day report (hydration, meals, steps).

**Request:**

```json
{
  "hydrationLiters": 2.5,
  "meals": 3,
  "steps": 8500,
  "temperature": 22,
  "pressure": 1013
}
```

### POST `/api/workouts`

Log a workout session.

**Request:**

```json
{
  "activityType": "strength_training",
  "timestamp": "2025-10-05T10:00:00.000Z",
  "sets": [{ "exercise": "squat", "reps": 10, "weight": 100 }],
  "volumeLoad": 1000,
  "rpe": 7,
  "durationMin": 60
}
```

## Integrations

### POST `/api/integrations/connect`

Initiate OAuth flow for health integration.

**Request:**

```json
{
  "provider": "VITAL"
}
```

**Response:**

```json
{
  "authUrl": "https://link.tryvital.io/..."
}
```

### DELETE `/api/integrations/:id`

Disconnect a health integration.

## Stripe

### POST `/api/stripe/checkout`

Create Stripe checkout session for subscription.

**Request:**

```json
{
  "plan": "MONTHLY"
}
```

**Response:**

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/stripe/webhook`

Handle Stripe webhook events.

**Headers:**

- `stripe-signature`: Webhook signature for verification
