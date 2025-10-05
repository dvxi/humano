import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile-form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

async function getUserProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscription: true,
      trainer: true,
    },
  });

  return user;
}

export default async function ProfilePage() {
  const currentUser = await requireAuth();
  const user = await getUserProfile(currentUser.id);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{user.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {user.subscription && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription Plan</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge>{user.subscription.plan}</Badge>
                  <Badge variant="outline">{user.subscription.status}</Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userId={user.id}
            profile={user.profile}
            userName={user.name}
            isTrainer={user.role === 'TRAINER'}
            trainer={user.trainer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
