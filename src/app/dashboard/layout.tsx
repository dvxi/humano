import { requireAuth } from '@/lib/session';
import { DashboardNav } from '@/components/dashboard-nav';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  // Check if user has completed onboarding by checking for profile
  const profile = await db.profile.findUnique({
    where: { userId: user.id },
  });

  // Redirect to onboarding if user hasn't completed setup
  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
