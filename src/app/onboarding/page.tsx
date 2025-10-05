'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

type Step = 'role' | 'profile' | 'subscription';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>('role');
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            // User has already completed onboarding
            router.push('/dashboard');
          } else {
            setHasProfile(false);
          }
        })
        .catch(() => {
          setHasProfile(false);
        });
    }
  }, [status, router]);

  // Form data
  const [role, setRole] = useState<'USER' | 'TRAINER' | null>(null);
  const [profile, setProfile] = useState({
    age: '',
    sex: '',
    heightCm: '',
    weightKg: '',
    location: '',
  });
  const [subscription, setSubscription] = useState<'FREE_FINDER' | 'MONTHLY'>('FREE_FINDER');

  const handleRoleSelection = (selectedRole: 'USER' | 'TRAINER') => {
    setRole(selectedRole);
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('subscription');
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          profile: {
            age: profile.age ? parseInt(profile.age) : null,
            sex: profile.sex || null,
            heightCm: profile.heightCm ? parseFloat(profile.heightCm) : null,
            weightKg: profile.weightKg ? parseFloat(profile.weightKg) : null,
            location: profile.location || null,
          },
          subscription,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Onboarding failed');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking profile status
  if (status === 'loading' || hasProfile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-[family-name:var(--font-noto-serif-hebrew)]">
              Welcome to Humano
            </CardTitle>
            <CardDescription>Choose your role to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleRoleSelection('USER')}
              className="group relative overflow-hidden rounded-lg border-2 border-border p-6 text-left transition-all hover:border-primary"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">I&apos;m an Athlete</h3>
                <p className="text-sm text-muted-foreground">
                  Track your workouts, monitor recovery metrics, and get AI-powered training
                  recommendations.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection('TRAINER')}
              className="group relative overflow-hidden rounded-lg border-2 border-border p-6 text-left transition-all hover:border-primary"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">I&apos;m a Trainer</h3>
                <p className="text-sm text-muted-foreground">
                  Get listed in our trainer directory and connect with athletes looking for
                  coaching.
                </p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>Help us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="30"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select
                  value={profile.sex}
                  onValueChange={(v) => setProfile({ ...profile, sex: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="180"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="75"
                    value={profile.weightKg}
                    onChange={(e) => setProfile({ ...profile, weightKg: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Warsaw, Poland"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep('role')}>
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'subscription') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Choose your plan</CardTitle>
            <CardDescription>Select the plan that works best for you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setSubscription('FREE_FINDER')}
              className={`relative overflow-hidden rounded-lg border-2 p-6 text-left transition-all ${
                subscription === 'FREE_FINDER'
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Free Trainer Finder</h3>
                <p className="text-2xl font-bold">$0/month</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Browse trainer directory</li>
                  <li>✓ Contact trainers</li>
                  <li>✓ Basic profile</li>
                </ul>
              </div>
            </button>

            <button
              onClick={() => setSubscription('MONTHLY')}
              className={`relative overflow-hidden rounded-lg border-2 p-6 text-left transition-all ${
                subscription === 'MONTHLY'
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Full Access</h3>
                <p className="text-2xl font-bold">$29/month</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Everything in Free</li>
                  <li>✓ Health integrations</li>
                  <li>✓ AI recommendations</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Workout tracking</li>
                </ul>
              </div>
            </button>
          </CardContent>
          <CardContent>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('profile')}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
