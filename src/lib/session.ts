import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }
  return user;
}

export async function requireRole(role: 'USER' | 'TRAINER') {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect('/dashboard');
  }
  return user;
}
