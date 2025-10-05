'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Separator } from './ui/separator';

interface ProfileFormProps {
  userId: string;
  profile: {
    age: number | null;
    sex: string | null;
    heightCm: number | null;
    weightKg: number | null;
    location: string | null;
    ethnicity: string | null;
  } | null;
  userName: string | null;
  isTrainer: boolean;
  trainer: {
    bio: string | null;
    pricePerSession: number | null;
    location: string | null;
    contact: string | null;
  } | null;
}

export function ProfileForm({
  userId: _userId,
  profile,
  userName,
  isTrainer,
  trainer,
}: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // User profile state
  const [name, setName] = useState(userName || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState(profile?.sex || '');
  const [heightCm, setHeightCm] = useState(profile?.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState(profile?.weightKg?.toString() || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [ethnicity, setEthnicity] = useState(profile?.ethnicity || '');

  // Trainer profile state
  const [bio, setBio] = useState(trainer?.bio || '');
  const [pricePerSession, setPricePerSession] = useState(
    trainer?.pricePerSession?.toString() || ''
  );
  const [trainerContact, setTrainerContact] = useState(trainer?.contact || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profile: {
            age: age ? parseInt(age) : null,
            sex: sex || null,
            heightCm: heightCm ? parseFloat(heightCm) : null,
            weightKg: weightKg ? parseFloat(weightKg) : null,
            location: location || null,
            ethnicity: ethnicity || null,
          },
          ...(isTrainer && {
            trainer: {
              bio: bio || null,
              pricePerSession: pricePerSession ? parseFloat(pricePerSession) : null,
              location: location || null,
              contact: trainerContact || null,
            },
          }),
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        router.refresh();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select value={sex} onValueChange={setSex}>
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="180"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="75"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Warsaw, Poland"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ethnicity">Ethnicity (optional)</Label>
          <Input
            id="ethnicity"
            type="text"
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            placeholder="e.g., Caucasian, Asian, etc."
          />
        </div>
      </div>

      {/* Trainer Information */}
      {isTrainer && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Trainer Information</h3>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential clients about your experience and specializations..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Session ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={pricePerSession}
                onChange={(e) => setPricePerSession(e.target.value)}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information</Label>
              <Input
                id="contact"
                type="text"
                value={trainerContact}
                onChange={(e) => setTrainerContact(e.target.value)}
                placeholder="email@example.com or phone number"
              />
            </div>
          </div>
        </>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
