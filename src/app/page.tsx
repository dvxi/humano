import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-noto-serif-hebrew)]">H</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-6xl font-bold tracking-tight font-[family-name:var(--font-noto-serif-hebrew)]">
            Humano
          </h1>
          <h2 className="text-3xl font-semibold tracking-tight">
            Optimize Your Training with AI-Powered Insights
          </h2>
          <p className="text-xl text-muted-foreground">
            Track workouts, monitor recovery metrics, and get personalized training recommendations
            based on your HRV, sleep, and performance data.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Health Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Connect with Vital, Terra, Polar, Google Fit, and more to automatically sync your
              health data.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Get daily training suggestions based on your recovery metrics and training load.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Find Trainers</h3>
            <p className="text-sm text-muted-foreground">
              Browse our directory of certified trainers and connect with the perfect coach for you.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Fitness & Wellbeing. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
