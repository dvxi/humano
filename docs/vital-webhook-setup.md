# 🔔 Vital Webhook Setup Guide

## When to Set Up Webhooks

Set up webhooks **after** you've deployed your app or set up ngrok for local testing. Webhooks need a publicly accessible URL to receive data.

---

## Step 1: Get Your Webhook URL

### For Local Development (Using ngrok)

1. Install ngrok:

```bash
brew install ngrok  # macOS
# or download from https://ngrok.com/download
```

2. Start your Next.js app:

```bash
pnpm dev
```

3. In a new terminal, start ngrok:

```bash
ngrok http 3000
```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Your webhook URL will be:

```
https://abc123.ngrok.io/api/webhooks/vital
```

### For Production

Your webhook URL will be:

```
https://your-domain.com/api/webhooks/vital
```

---

## Step 2: Configure Webhooks in Vital Dashboard

1. **Go to Vital Dashboard**
   - Visit https://app.tryvital.io
   - Sign in to your account

2. **Navigate to Webhooks**
   - Click on **Settings** in the sidebar
   - Click on **Webhooks**

3. **Add Webhook Endpoint**
   - Click **"Add Endpoint"** or **"Create Webhook"**
   - Enter your webhook URL: `https://your-url.com/api/webhooks/vital`
   - Click **Save**

4. **Select Events to Subscribe**

   Check these events (these are the ones our app handles):

   **Daily Data Events:**
   - ☑️ `daily.data.sleep.created` - Sleep data from devices
   - ☑️ `daily.data.sleep.updated` - Sleep data updates
   - ☑️ `daily.data.activity.created` - Daily activity summary
   - ☑️ `daily.data.activity.updated` - Activity updates
   - ☑️ `daily.data.body.created` - Body metrics (weight, body fat, etc.)
   - ☑️ `daily.data.body.updated` - Body metrics updates

   **Workout Events:**
   - ☑️ `daily.workouts.created` - New workout sessions
   - ☑️ `daily.workouts.updated` - Workout updates
   - ☑️ `daily.data.workout_distance.created` - Workout distance data
   - ☑️ `daily.data.workout_duration.created` - Workout duration data
   - ☑️ `daily.data.workout_stream.created` - Workout stream data (heart rate, etc.)

   **User Events (Recommended):**
   - ☑️ `user.connected` - When user connects a device
   - ☑️ `user.disconnected` - When user disconnects a device

   **Note:** The exact event names may vary. In the Vital dashboard, look for events like:
   - `workouts.created` and `workouts.updated`
   - `workout_distance.created`
   - `workout_duration.created`
   - `workout_stream.created`

5. **Get Webhook Secret**
   - After creating the webhook, Vital will show you a **Webhook Signing Secret**
   - It looks like: `whsec_abc123...`
   - **Copy this secret** - you'll need it!

6. **Add to Environment Variables**

   Add to your `.env` file:

   ```bash
   VITAL_WEBHOOK_SECRET=whsec_abc123...
   ```

---

## Step 3: Test Your Webhook

### Using Vital Dashboard

1. Go to **Settings** → **Webhooks**
2. Find your webhook endpoint
3. Click **"Send Test Event"**
4. Select an event type (e.g., `daily.data.sleep.created`)
5. Click **Send**

### Check Your Logs

You should see in your terminal:

```
✅ Webhook received: daily.data.sleep.created
✅ Signature verified
✅ Stored 3 metrics for user user_123
```

---

## Webhook Event Examples

### 1. Sleep Data Event

```json
{
  "event_type": "daily.data.sleep.created",
  "user_id": "user_123",
  "client_user_id": "your_user_id",
  "data": {
    "date": "2025-10-05",
    "sleep": {
      "duration": 28800,
      "efficiency": 0.92,
      "hrv": {
        "avg_hrv_rmssd": 65.5
      },
      "heart_rate": {
        "avg_hr_bpm": 58,
        "min_hr_bpm": 52,
        "max_hr_bpm": 72
      },
      "stages": {
        "deep": 7200,
        "rem": 5400,
        "light": 14400,
        "awake": 1800
      }
    }
  }
}
```

### 2. Activity Data Event

```json
{
  "event_type": "daily.data.activity.created",
  "user_id": "user_123",
  "client_user_id": "your_user_id",
  "data": {
    "date": "2025-10-05",
    "activity": {
      "steps": 8543,
      "distance_meters": 6234,
      "calories_total": 2456,
      "calories_active": 456,
      "active_duration": 3600
    }
  }
}
```

### 3. Workout Event

```json
{
  "event_type": "daily.data.workout.created",
  "user_id": "user_123",
  "client_user_id": "your_user_id",
  "data": {
    "workout": {
      "id": "workout_123",
      "sport": "strength_training",
      "start": "2025-10-05T10:00:00Z",
      "end": "2025-10-05T11:00:00Z",
      "duration": 3600,
      "calories": 456,
      "heart_rate": {
        "avg_bpm": 120,
        "max_bpm": 165
      }
    }
  }
}
```

---

## What Our App Does With Webhooks

When a webhook is received, our app:

1. **Verifies the signature** - Ensures the request is from Vital
2. **Parses the event** - Extracts the data
3. **Normalizes the data** - Converts to our metric format
4. **Stores in database** - Saves to the `Metric` table
5. **Returns 200 OK** - Confirms receipt

### Example: Sleep Data Processing

```typescript
// Webhook receives sleep data
{
  hrv: 65.5,
  rhr: 58,
  sleep_duration: 8 hours
}

// We store as 3 separate metrics:
Metric { type: 'HRV', value: 65.5, unit: 'ms' }
Metric { type: 'RHR', value: 58, unit: 'bpm' }
Metric { type: 'SLEEP', value: 8, unit: 'hours' }
```

---

## Troubleshooting

### Webhook Not Receiving Data

1. **Check URL is correct**
   - Must be HTTPS (not HTTP)
   - Must be publicly accessible
   - Path must be `/api/webhooks/vital`

2. **Check ngrok is running** (for local dev)

   ```bash
   ngrok http 3000
   ```

3. **Check webhook is active in Vital dashboard**
   - Go to Settings → Webhooks
   - Ensure status is "Active"

4. **Check events are subscribed**
   - Ensure you've checked the event boxes

### Signature Verification Failing

1. **Check webhook secret is correct**

   ```bash
   # In .env
   VITAL_WEBHOOK_SECRET=whsec_abc123...
   ```

2. **Restart your app** after adding the secret
   ```bash
   pnpm dev
   ```

### No Data Appearing in Dashboard

1. **Check webhook logs** in Vital dashboard
   - Go to Settings → Webhooks → Your Endpoint
   - Click "View Logs"
   - Check for errors

2. **Check your app logs**

   ```bash
   # Should see:
   ✅ Webhook received
   ✅ Stored X metrics
   ```

3. **Check database**
   ```bash
   pnpm db:studio
   # Look in Metric table
   ```

---

## Security Best Practices

1. **Always verify signatures**
   - Never skip signature verification
   - Use the provided webhook secret

2. **Use HTTPS only**
   - Never use HTTP for webhooks
   - Vital requires HTTPS

3. **Rate limit webhook endpoint**
   - Prevent abuse
   - Our app has basic rate limiting

4. **Log all webhook events**
   - For debugging
   - For audit trail

---

## Next Steps After Setup

Once webhooks are working:

1. **Connect a test device**
   - Use Vital's OAuth flow
   - Connect your Apple Watch, Garmin, etc.

2. **Generate test data**
   - Vital sandbox can generate fake data
   - Or use real device data

3. **Check dashboard**
   - Go to `/dashboard`
   - See your metrics appear!

4. **Monitor webhook logs**
   - Check Vital dashboard for delivery status
   - Check your app logs for processing

---

## Summary Checklist

- [ ] App is running (locally with ngrok or deployed)
- [ ] Webhook URL is publicly accessible
- [ ] Webhook endpoint created in Vital dashboard
- [ ] Events are subscribed:
  - [ ] `daily.data.sleep.created` and `.updated`
  - [ ] `daily.data.activity.created` and `.updated`
  - [ ] `daily.data.body.created` and `.updated`
  - [ ] `daily.workouts.created` and `.updated`
  - [ ] `daily.data.workout_distance.created`
  - [ ] `daily.data.workout_duration.created`
  - [ ] `daily.data.workout_stream.created`
  - [ ] `user.connected` and `user.disconnected`
- [ ] Webhook secret copied to `.env`
- [ ] App restarted after adding secret
- [ ] Test event sent from Vital dashboard
- [ ] Webhook received and processed successfully
- [ ] Data appears in database
- [ ] Metrics show on dashboard

---

**You're ready!** Once webhooks are set up, your app will automatically receive health data from all connected devices. 🎉
