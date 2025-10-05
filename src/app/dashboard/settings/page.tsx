import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

async function getUserSettings(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      reminders: true,
    },
  });

  return user;
}

export default async function SettingsPage() {
  const currentUser = await requireAuth();
  const user = await getUserSettings(currentUser.id);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.subscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge>{user.subscription.plan}</Badge>
                    <Badge variant="outline">{user.subscription.status}</Badge>
                  </div>
                </div>
                {user.subscription.plan === 'FREE_FINDER' && (
                  <Button>Upgrade to Full Access</Button>
                )}
              </div>

              {user.subscription.plan === 'MONTHLY' && user.subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Next billing date:{' '}
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Plan Features</p>
                {user.subscription.plan === 'FREE_FINDER' ? (
                  <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Browse trainer directory</li>
                    <li>Contact trainers</li>
                    <li>Basic profile</li>
                  </ul>
                ) : (
                  <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                    <li>All Free features</li>
                    <li>Health device integrations</li>
                    <li>AI-powered recommendations</li>
                    <li>Advanced analytics</li>
                    <li>Workout tracking</li>
                    <li>Daily reports</li>
                  </ul>
                )}
              </div>

              {user.subscription.plan === 'MONTHLY' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Manage Billing
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Update payment method, view invoices, or cancel subscription
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">No active subscription</p>
              <Button className="mt-4">Choose a Plan</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about your workouts and metrics
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get reminded to log your morning and day reports
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connected Integrations</p>
              <p className="text-sm text-muted-foreground">Manage your health device connections</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/integrations">Manage</Link>
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Information</p>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
