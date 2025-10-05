import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Heart, Moon, TrendingUp, Droplet, Zap } from 'lucide-react';
import { generateRecommendations } from '@/lib/ai/openai';
import { subDays } from 'date-fns';

async function getRecentMetrics(userId: string) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const metrics = await db.metric.findMany({
    where: {
      userId,
      timestamp: {
        gte: yesterday,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 10,
  });

  return metrics;
}

async function getRecommendation(userId: string) {
  try {
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return {
        type: 'MODERATE' as const,
        rationale:
          'Connect your health devices to get AI-powered personalized training recommendations.',
      };
    }

    // Fetch user data for AI recommendation
    const [profile, recentMetrics, recentWorkouts] = await Promise.all([
      db.profile.findUnique({ where: { userId } }),
      db.metric.findMany({
        where: {
          userId,
          timestamp: { gte: subDays(new Date(), 7) },
        },
        orderBy: { timestamp: 'desc' },
      }),
      db.workout.findMany({
        where: {
          userId,
          timestamp: { gte: subDays(new Date(), 7) },
        },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    // Calculate average metrics
    const avgMetrics = {
      avgSteps:
        recentMetrics.filter((m) => m.type === 'STEPS').reduce((sum, m) => sum + m.value, 0) /
        Math.max(recentMetrics.filter((m) => m.type === 'STEPS').length, 1),
      avgSleep:
        recentMetrics.filter((m) => m.type === 'SLEEP').reduce((sum, m) => sum + m.value, 0) /
        Math.max(recentMetrics.filter((m) => m.type === 'SLEEP').length, 1),
      avgHeartRate:
        recentMetrics.filter((m) => m.type === 'RHR').reduce((sum, m) => sum + m.value, 0) /
        Math.max(recentMetrics.filter((m) => m.type === 'RHR').length, 1),
    };

    // Generate AI recommendation
    const aiResponse = await generateRecommendations({
      profile: {
        age: profile?.age || undefined,
        sex: profile?.sex || undefined,
        weight: profile?.weightKg || undefined,
        height: profile?.heightCm || undefined,
        fitnessLevel: undefined,
        goals: undefined,
      },
      recentMetrics: avgMetrics,
      recentWorkouts: recentWorkouts.map((w) => ({
        type: w.activityType,
        duration: w.durationMin || 0,
        date: w.timestamp,
      })),
    });

    // Determine intensity based on AI insights
    const hasWarnings = aiResponse.warnings.length > 0;
    const workoutCount = recentWorkouts.length;

    let intensity: 'REST' | 'EASY' | 'MODERATE' | 'HARD' = 'MODERATE';
    if (hasWarnings || workoutCount >= 5) {
      intensity = 'REST';
    } else if (workoutCount >= 3) {
      intensity = 'EASY';
    } else if (workoutCount <= 1) {
      intensity = 'HARD';
    }

    return {
      type: intensity,
      rationale: aiResponse.recommendations[0] || 'Keep up the good work with your training!',
    };
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    // Fallback to placeholder
    return {
      type: 'MODERATE' as const,
      rationale: 'Based on your recent metrics, a moderate intensity workout is recommended.',
    };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const metrics = await getRecentMetrics(user.id);
  const recommendation = await getRecommendation(user.id);

  // Group metrics by type
  const metricsByType = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric);
      return acc;
    },
    {} as Record<string, typeof metrics>
  );

  const latestHRV = metricsByType.HRV?.[0];
  const latestRHR = metricsByType.RHR?.[0];
  const latestSleep = metricsByType.SLEEP?.[0];
  const latestSteps = metricsByType.STEPS?.[0];
  const latestHydration = metricsByType.HYDRATION?.[0];

  const recommendationColors = {
    REST: 'bg-accent',
    EASY: 'bg-secondary',
    MODERATE: 'bg-muted',
    HARD: 'bg-primary text-primary-foreground',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name || 'Athlete'}!</h1>
        <p className="text-muted-foreground">Here&apos;s your fitness overview for today</p>
      </div>

      {/* Daily Recommendation */}
      <Card className={recommendationColors[recommendation.type]}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today&apos;s Recommendation</CardTitle>
            <Badge variant="outline" className="text-lg font-bold">
              {recommendation.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p>{recommendation.rationale}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/activity">Log Workout</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate Variability</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestHRV ? (
              <>
                <div className="text-2xl font-bold">
                  {latestHRV.value.toFixed(0)} {latestHRV.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestHRV.timestamp).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resting Heart Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestRHR ? (
              <>
                <div className="text-2xl font-bold">
                  {latestRHR.value.toFixed(0)} {latestRHR.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestRHR.timestamp).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestSleep ? (
              <>
                <div className="text-2xl font-bold">
                  {latestSleep.value.toFixed(1)} {latestSleep.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestSleep.timestamp).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestSteps ? (
              <>
                <div className="text-2xl font-bold">
                  {latestSteps.value.toLocaleString()} {latestSteps.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestSteps.timestamp).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hydration</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestHydration ? (
              <>
                <div className="text-2xl font-bold">
                  {latestHydration.value.toFixed(1)} {latestHydration.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestHydration.timestamp).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/integrations">Connect Devices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Log your daily metrics and activities</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/reports?type=morning">Morning Report</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reports?type=day">Day Report</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/activity">Log Workout</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/history">View History</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
