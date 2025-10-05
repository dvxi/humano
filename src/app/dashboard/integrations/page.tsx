import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IntegrationCard } from '@/components/integration-card';

async function getUserIntegrations(userId: string) {
  const integrations = await db.integration.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return integrations;
}

export default async function IntegrationsPage() {
  const user = await requireAuth();
  const integrations = await getUserIntegrations(user.id);

  // Create a map of connected integrations
  const connectedMap = integrations.reduce(
    (acc, integration) => {
      acc[integration.provider] = integration;
      return acc;
    },
    {} as Record<string, (typeof integrations)[0]>
  );

  const availableIntegrations = [
    {
      id: 'vital',
      name: 'Vital',
      provider: 'VITAL' as const,
      description: 'Connect to 300+ devices including Apple Watch, Garmin, Oura, Whoop, and more',
      icon: '🔗',
      features: ['Sleep tracking', 'HRV & RHR', 'Activity data', 'Workouts'],
      recommended: true,
    },
    {
      id: 'terra',
      name: 'Terra',
      provider: 'TERRA' as const,
      description: 'Alternative health data aggregator with support for major wearables',
      icon: '🌍',
      features: ['Sleep tracking', 'Activity data', 'Body metrics', 'Nutrition'],
      recommended: false,
    },
    {
      id: 'polar',
      name: 'Polar',
      provider: 'POLAR' as const,
      description: 'Direct connection to Polar devices and Polar Flow',
      icon: '⌚',
      features: ['Heart rate', 'Training load', 'Recovery', 'Sleep'],
      recommended: false,
    },
    {
      id: 'googlefit',
      name: 'Google Fit',
      provider: 'GOOGLEFIT' as const,
      description: 'Connect your Google Fit data from Android devices',
      icon: '📱',
      features: ['Steps', 'Activity', 'Heart rate', 'Weight'],
      recommended: false,
    },
    {
      id: 'apple_health',
      name: 'Apple Health',
      provider: 'APPLE_HEALTH' as const,
      description: 'Connect via Vital to access Apple Health data',
      icon: '🍎',
      features: ['All health metrics', 'Workouts', 'Sleep', 'Heart rate'],
      recommended: true,
      requiresVital: true,
    },
    {
      id: 'garmin',
      name: 'Garmin',
      provider: 'GARMIN' as const,
      description: 'Connect via Vital to access Garmin data',
      icon: '⌚',
      features: ['Training metrics', 'Recovery', 'Sleep', 'Performance'],
      recommended: true,
      requiresVital: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your health devices and apps to automatically sync your data
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            {integrations.length === 0
              ? 'No integrations connected yet'
              : `${integrations.length} integration${integrations.length === 1 ? '' : 's'} connected`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {integrations.map((integration) => (
                <Badge key={integration.id} variant="outline" className="gap-2">
                  {integration.provider}
                  <span
                    className={`h-2 w-2 rounded-full ${
                      integration.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect an integration below to start syncing your health data automatically
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {availableIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              connectedIntegration={connectedMap[integration.provider]}
            />
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>💡 Tip: Start with Vital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Vital</strong> is recommended as your first integration because it connects to
            300+ devices with a single connection, including:
          </p>
          <ul className="ml-6 list-disc space-y-1 text-sm">
            <li>Apple Watch (via Apple Health)</li>
            <li>Garmin devices</li>
            <li>Oura Ring</li>
            <li>Whoop</li>
            <li>Fitbit</li>
            <li>And many more...</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            You only need to connect once to access all your devices!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
