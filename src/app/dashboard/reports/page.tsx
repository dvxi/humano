'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('type') || 'morning';

  const [isLoading, setIsLoading] = useState(false);

  // Morning report state
  const [morningData, setMorningData] = useState({
    mood: '',
    stress: '',
    soreness: '',
    sleepQuality: '',
    sleepHours: '',
  });

  // Day report state
  const [dayData, setDayData] = useState({
    hydration: '',
    meals: '',
    steps: '',
    temperature: '',
    pressure: '',
  });

  const handleMorningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/logs/morning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          mood: morningData.mood ? parseInt(morningData.mood) : null,
          stress: morningData.stress ? parseInt(morningData.stress) : null,
          soreness: morningData.soreness ? parseInt(morningData.soreness) : null,
          sleepQuality: morningData.sleepQuality ? parseInt(morningData.sleepQuality) : null,
          sleepHours: morningData.sleepHours ? parseFloat(morningData.sleepHours) : null,
        }),
      });

      if (response.ok) {
        toast.success('Morning report submitted!');
        setMorningData({
          mood: '',
          stress: '',
          soreness: '',
          sleepQuality: '',
          sleepHours: '',
        });
        router.push('/dashboard');
      } else {
        toast.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Morning report error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/logs/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          hydration: dayData.hydration ? parseFloat(dayData.hydration) : null,
          meals: dayData.meals ? parseInt(dayData.meals) : null,
          steps: dayData.steps ? parseInt(dayData.steps) : null,
          temperature: dayData.temperature ? parseFloat(dayData.temperature) : null,
          pressure: dayData.pressure ? parseFloat(dayData.pressure) : null,
        }),
      });

      if (response.ok) {
        toast.success('Day report submitted!');
        setDayData({
          hydration: '',
          meals: '',
          steps: '',
          temperature: '',
          pressure: '',
        });
        router.push('/dashboard');
      } else {
        toast.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Day report error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Daily Reports</h1>
        <p className="text-muted-foreground">Log your daily wellbeing metrics</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="morning">
            <Moon className="mr-2 h-4 w-4" />
            Morning Report
          </TabsTrigger>
          <TabsTrigger value="day">
            <Sun className="mr-2 h-4 w-4" />
            Day Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning">
          <Card>
            <CardHeader>
              <CardTitle>Morning Check-In</CardTitle>
              <CardDescription>How are you feeling this morning?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMorningSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">
                      Mood{' '}
                      <span className="text-xs text-muted-foreground">(1-5, 5 = excellent)</span>
                    </Label>
                    <Input
                      id="mood"
                      type="number"
                      min="1"
                      max="5"
                      value={morningData.mood}
                      onChange={(e) => setMorningData({ ...morningData, mood: e.target.value })}
                      placeholder="4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stress">
                      Stress Level{' '}
                      <span className="text-xs text-muted-foreground">
                        (1-5, 5 = very stressed)
                      </span>
                    </Label>
                    <Input
                      id="stress"
                      type="number"
                      min="1"
                      max="5"
                      value={morningData.stress}
                      onChange={(e) => setMorningData({ ...morningData, stress: e.target.value })}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soreness">
                      Muscle Soreness{' '}
                      <span className="text-xs text-muted-foreground">(1-5, 5 = very sore)</span>
                    </Label>
                    <Input
                      id="soreness"
                      type="number"
                      min="1"
                      max="5"
                      value={morningData.soreness}
                      onChange={(e) => setMorningData({ ...morningData, soreness: e.target.value })}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleepQuality">
                      Sleep Quality{' '}
                      <span className="text-xs text-muted-foreground">(1-5, 5 = excellent)</span>
                    </Label>
                    <Input
                      id="sleepQuality"
                      type="number"
                      min="1"
                      max="5"
                      value={morningData.sleepQuality}
                      onChange={(e) =>
                        setMorningData({ ...morningData, sleepQuality: e.target.value })
                      }
                      placeholder="4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleepHours">Sleep Duration (hours)</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      step="0.5"
                      value={morningData.sleepHours}
                      onChange={(e) =>
                        setMorningData({ ...morningData, sleepHours: e.target.value })
                      }
                      placeholder="7.5"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Submitting...' : 'Submit Morning Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day">
          <Card>
            <CardHeader>
              <CardTitle>Day Check-In</CardTitle>
              <CardDescription>Track your daily activities and environment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDaySubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hydration">Hydration (liters)</Label>
                    <Input
                      id="hydration"
                      type="number"
                      step="0.1"
                      value={dayData.hydration}
                      onChange={(e) => setDayData({ ...dayData, hydration: e.target.value })}
                      placeholder="2.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meals">Number of Meals</Label>
                    <Input
                      id="meals"
                      type="number"
                      value={dayData.meals}
                      onChange={(e) => setDayData({ ...dayData, meals: e.target.value })}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steps">Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      value={dayData.steps}
                      onChange={(e) => setDayData({ ...dayData, steps: e.target.value })}
                      placeholder="8000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={dayData.temperature}
                      onChange={(e) => setDayData({ ...dayData, temperature: e.target.value })}
                      placeholder="22"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pressure">Air Pressure (hPa)</Label>
                    <Input
                      id="pressure"
                      type="number"
                      step="0.1"
                      value={dayData.pressure}
                      onChange={(e) => setDayData({ ...dayData, pressure: e.target.value })}
                      placeholder="1013"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Submitting...' : 'Submit Day Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
