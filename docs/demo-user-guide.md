# Demo User Guide

## Overview

The demo user account showcases a realistic 90-day fitness journey with comprehensive data across all app features.

## Demo User Details

- **User ID**: `cmgdeu3k70000z5zctfzo1aw5`
- **Profile**: 28-year-old male, 178cm, starting weight 85kg → 82.5kg
- **Location**: San Francisco, CA
- **Data Period**: Last 90 days (July 7 - October 5, 2025)

## Data Included

### 1. Profile & Integrations

- ✅ Complete profile with realistic stats
- ✅ Connected to Vital (Oura Ring)
- ✅ Connected to Apple Health
- ✅ Active reminders (Morning 8:00 AM, Day 8:00 PM)

### 2. Daily Metrics (975 data points)

#### Sleep & Recovery

- **Sleep Duration**: Improved from 6.5 → 7.5 hours
- **Sleep Quality**: Improved from 3/5 → 4.5/5
- **HRV (Heart Rate Variability)**: Improved from 45 → 65 ms
- **RHR (Resting Heart Rate)**: Improved from 68 → 58 bpm

#### Activity & Fitness

- **Daily Steps**: 7,000-12,000 steps (higher on weekdays)
- **Calories Burned**: 1,800-2,500 kcal/day
- **Active Minutes**: Tracked via workouts

#### Body Composition

- **Weight**: Progressive loss from 85kg → 82.5kg
- **Body Fat**: Tracked alongside weight

#### Wellness

- **Mood**: Improved from 3/5 → 4/5
- **Stress**: Decreased from 4/5 → 2.5/5
- **Hydration**: Improved from 1.5 → 2.5 liters/day
- **Soreness**: Tracked post-workout

### 3. Workouts (78 sessions)

#### Weekly Schedule

- **Monday/Wednesday/Friday**: Strength Training
  - Exercises: Squats, Bench Press, Deadlifts, Pull-ups
  - Progressive overload: Weights increasing over time
  - Duration: ~60 minutes
  - RPE: 7-8/10
  - Volume Load: Calculated from sets × reps × weight

- **Tuesday/Thursday**: Cardio (Running)
  - Duration: 30-40 minutes
  - Distance: 5-7 km
  - Pace: ~6 min/km
  - Avg Heart Rate: 145-155 bpm
  - RPE: 6-7/10

- **Saturday**: Active Recovery (Yoga)
  - Duration: 45 minutes
  - Focus: Flexibility and recovery
  - RPE: 3/10

- **Sunday**: Rest Day

#### Progressive Improvements

- Squat: 80kg → 107kg
- Bench Press: 60kg → 78kg
- Deadlift: 100kg → 136kg
- Running pace: Gradually improving

### 4. Notifications (4 messages)

- Progress milestones
- Personal records
- Sleep improvements
- Weekly summaries

## Realistic Journey Narrative

### Weeks 1-4: Foundation Phase

- Establishing routine
- Moderate weights and cardio
- Sleep quality inconsistent (6-7 hours)
- Learning proper form

### Weeks 5-8: Adaptation Phase

- Weights increasing steadily
- Sleep improving (7-7.5 hours)
- Better recovery (higher HRV)
- Mood and energy improving

### Weeks 9-12: Progress Phase

- Significant strength gains
- Consistent 7.5+ hours sleep
- Low resting heart rate (58 bpm)
- Weight loss plateau and breakthrough
- High motivation and adherence

### Week 13 (Current)

- Peak performance
- All metrics optimized
- Sustainable routine established
- Ready for next phase

## Data Patterns & Insights

### Positive Trends

1. **Sleep Quality** ↗️ Consistent improvement
2. **HRV** ↗️ Better recovery capacity
3. **RHR** ↘️ Improved cardiovascular fitness
4. **Strength** ↗️ Progressive overload working
5. **Weight** ↘️ Healthy fat loss rate (~0.3kg/week)
6. **Mood** ↗️ Better mental health
7. **Stress** ↘️ Better stress management

### Weekly Patterns

- **Weekdays**: Higher activity, more structured
- **Weekends**: Lower steps, active recovery
- **Post-Workout**: Elevated soreness (normal)
- **Rest Days**: Lower calories, better recovery

### Correlations Visible in Data

- Better sleep → Higher HRV next day
- Consistent workouts → Improved mood
- Adequate hydration → Better performance
- Rest days → Lower soreness scores

## Use Cases for Demo

### 1. Dashboard Showcase

- Rich metric cards with real trends
- Historical data for charts
- Recent workout history
- AI recommendations based on actual data

### 2. History & Analytics

- 90-day trend charts
- Week-over-week comparisons
- Personal records tracking
- Progress visualization

### 3. Integration Demo

- Shows connected devices (Oura, Apple Health)
- Demonstrates data sync
- Real webhook data flow

### 4. AI Recommendations

- Sufficient data for meaningful insights
- Visible patterns for AI to analyze
- Personalized suggestions based on trends

### 5. Workout Logging

- Examples of different workout types
- Progressive overload demonstration
- RPE and volume load tracking

## Regenerating Demo Data

To regenerate or update demo data:

```bash
pnpm tsx prisma/seed-demo-user.ts
```

This will:

- Update profile
- Recreate integrations
- Generate fresh 90 days of metrics
- Create new workout history
- Add notifications

**Note**: The script uses `skipDuplicates: true` to avoid conflicts.

## Customization

Edit `prisma/seed-demo-user.ts` to customize:

- `DAYS_OF_DATA`: Change data period (default: 90)
- Starting values: Weight, fitness level, etc.
- Workout schedule: Different split or activities
- Metric ranges: Adjust baselines and targets
- Trend rates: Faster/slower improvements

## Testing Scenarios

### Scenario 1: New User Onboarding

Compare demo user's rich dashboard with a new user's empty state.

### Scenario 2: Progress Tracking

Show how metrics evolve over time with consistent training.

### Scenario 3: Integration Value

Demonstrate automatic data sync vs. manual entry.

### Scenario 4: AI Insights

Show personalized recommendations based on actual patterns.

### Scenario 5: Workout Planning

Display historical performance to plan future sessions.

## Data Quality

All data is:

- ✅ **Realistic**: Based on actual fitness progressions
- ✅ **Consistent**: Follows logical patterns and correlations
- ✅ **Varied**: Includes natural day-to-day variations
- ✅ **Progressive**: Shows improvement over time
- ✅ **Complete**: Covers all major features and metrics

## Notes

- Data is generated with realistic variance (±10-20%)
- Trends follow evidence-based fitness principles
- Rest and recovery days are properly included
- Metrics correlate logically (e.g., poor sleep → lower HRV)
- Progressive overload follows standard 2-5% weekly increases
