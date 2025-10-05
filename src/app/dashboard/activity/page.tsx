'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Watch } from 'lucide-react';

interface ExerciseSet {
  id: string;
  exercise: string;
  reps: string;
  weight: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [watchConnected, setWatchConnected] = useState(false);

  // Form state
  const [activityType, setActivityType] = useState('strength_training');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [durationMin, setDurationMin] = useState('');
  const [rpe, setRpe] = useState('');
  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: '1', exercise: '', reps: '', weight: '' },
  ]);

  const addSet = () => {
    setSets([...sets, { id: Date.now().toString(), exercise: '', reps: '', weight: '' }]);
  };

  const removeSet = (id: string) => {
    setSets(sets.filter((set) => set.id !== id));
  };

  const updateSet = (id: string, field: keyof ExerciseSet, value: string) => {
    setSets(sets.map((set) => (set.id === id ? { ...set, [field]: value } : set)));
  };

  const calculateVolumeLoad = () => {
    return sets.reduce((total, set) => {
      const reps = parseFloat(set.reps) || 0;
      const weight = parseFloat(set.weight) || 0;
      return total + reps * weight;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const volumeLoad = calculateVolumeLoad();

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType,
          timestamp: new Date(timestamp).toISOString(),
          sets: sets.map((set) => ({
            exercise: set.exercise,
            reps: parseFloat(set.reps) || 0,
            weight: parseFloat(set.weight) || 0,
          })),
          volumeLoad,
          rpe: rpe ? parseInt(rpe) : null,
          durationMin: durationMin ? parseInt(durationMin) : null,
        }),
      });

      if (response.ok) {
        toast.success('Workout logged successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Failed to log workout');
      }
    } catch (error) {
      console.error('Workout submission error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Log Activity</h1>
        <p className="text-muted-foreground">Record your workout session</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workout Details</CardTitle>
              <CardDescription>Enter your workout information</CardDescription>
            </div>
            <Button
              variant={watchConnected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWatchConnected(!watchConnected)}
            >
              <Watch className="mr-2 h-4 w-4" />
              {watchConnected ? 'Connected' : 'Connect Watch'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength_training">Strength Training</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestamp">Date & Time</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpe">
                  RPE (Rate of Perceived Exertion)
                  <span className="ml-2 text-xs text-muted-foreground">1-10</span>
                </Label>
                <Input
                  id="rpe"
                  type="number"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  placeholder="7"
                />
              </div>
            </div>

            {/* Sets */}
            {activityType === 'strength_training' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exercises & Sets</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSet}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Set
                  </Button>
                </div>

                <div className="space-y-3">
                  {sets.map((set, index) => (
                    <div key={set.id} className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="flex h-10 w-10 items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <Input
                        placeholder="Exercise (e.g., Squat)"
                        value={set.exercise}
                        onChange={(e) => updateSet(set.id, 'exercise', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                        className="w-24"
                      />
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Weight (kg)"
                        value={set.weight}
                        onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                        className="w-32"
                      />
                      {sets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSet(set.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">
                    Total Volume Load:{' '}
                    <span className="text-lg">{calculateVolumeLoad().toFixed(1)} kg</span>
                  </p>
                </div>
              </div>
            )}

            {watchConnected && (
              <Card className="bg-accent">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Watch connected! Heart rate and other metrics will be automatically recorded.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Logging...' : 'Log Workout'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
