import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricChart } from '@/components/metric-chart';
import { subDays } from 'date-fns';

async function getMetricHistory(userId: string, days: number = 30) {
  const startDate = subDays(new Date(), days);

  const metrics = await db.metric.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  return metrics;
}

async function getWorkoutHistory(userId: string, days: number = 30) {
  const startDate = subDays(new Date(), days);

  const workouts = await db.workout.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  return workouts;
}

export default async function HistoryPage() {
  const user = await requireAuth();
  const metrics = await getMetricHistory(user.id);
  const workouts = await getWorkoutHistory(user.id);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">View your metrics and trends over time</p>
      </div>

      <Tabs defaultValue="recovery" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
        </TabsList>

        {/* Recovery Metrics */}
        <TabsContent value="recovery" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Variability (HRV)</CardTitle>
                <CardDescription>Higher is generally better</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.HRV || []}
                  dataKey="value"
                  color="#000"
                  unit="ms"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resting Heart Rate (RHR)</CardTitle>
                <CardDescription>Lower is generally better</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.RHR || []}
                  dataKey="value"
                  color="#333"
                  unit="bpm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Duration</CardTitle>
                <CardDescription>Hours per night</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.SLEEP || []}
                  dataKey="value"
                  color="#666"
                  unit="hours"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Quality</CardTitle>
                <CardDescription>Self-reported (1-5 scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.SLEEP_QUALITY || []}
                  dataKey="value"
                  color="#999"
                  unit="score"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Metrics */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Steps</CardTitle>
                <CardDescription>Step count per day</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.STEPS || []}
                  dataKey="value"
                  color="#000"
                  unit="steps"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hydration</CardTitle>
                <CardDescription>Water intake per day</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.HYDRATION || []}
                  dataKey="value"
                  color="#333"
                  unit="liters"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wellbeing Metrics */}
        <TabsContent value="wellbeing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood</CardTitle>
                <CardDescription>Daily mood rating (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.MOOD || []}
                  dataKey="value"
                  color="#000"
                  unit="score"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stress Level</CardTitle>
                <CardDescription>Daily stress rating (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.STRESS || []}
                  dataKey="value"
                  color="#333"
                  unit="score"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Muscle Soreness</CardTitle>
                <CardDescription>Daily soreness rating (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={metricsByType.SORENESS || []}
                  dataKey="value"
                  color="#666"
                  unit="score"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workouts */}
        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your training history</CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <p className="text-center text-muted-foreground">No workouts logged yet</p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{workout.activityType.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.timestamp).toLocaleDateString()} at{' '}
                          {new Date(workout.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {workout.volumeLoad && (
                          <p className="text-sm font-medium">{workout.volumeLoad.toFixed(0)} kg</p>
                        )}
                        {workout.durationMin && (
                          <p className="text-sm text-muted-foreground">{workout.durationMin} min</p>
                        )}
                        {workout.rpe && (
                          <p className="text-sm text-muted-foreground">RPE: {workout.rpe}/10</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
