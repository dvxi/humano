'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface IntegrationCardProps {
  integration: {
    id: string;
    name: string;
    provider: string;
    description: string;
    icon: string;
    features: string[];
    recommended?: boolean;
    requiresVital?: boolean;
  };
  connectedIntegration?: {
    id: string;
    status: string;
    createdAt: Date;
  } | null;
}

export function IntegrationCard({ integration, connectedIntegration }: IntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = connectedIntegration?.status === 'CONNECTED';

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      // Handle Terra separately
      if (integration.provider === 'TERRA') {
        const response = await fetch('/api/integrations/terra/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providers: ['FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'STRAVA'],
          }),
        });

        const data = await response.json();

        if (response.ok && data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || 'Failed to initiate connection');
        }
        return;
      }

      // Handle other integrations (Vital, Polar, Google Fit)
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: integration.provider,
        }),
      });

      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Redirect to OAuth flow
        window.location.href = data.authUrl;
      } else {
        toast.error(data.error || 'Failed to initiate connection');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedIntegration) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/integrations/${connectedIntegration.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${integration.name} disconnected`);
        window.location.reload();
      } else {
        toast.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={integration.recommended ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{integration.icon}</span>
            <div>
              <CardTitle className="flex items-center gap-2">
                {integration.name}
                {integration.recommended && (
                  <Badge variant="outline" className="text-xs">
                    Recommended
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Features:</p>
          <div className="flex flex-wrap gap-2">
            {integration.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {integration.requiresVital && (
          <p className="text-xs text-muted-foreground">
            * Requires Vital integration to be connected first
          </p>
        )}

        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Connected on {new Date(connectedIntegration.createdAt).toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect {integration.name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
