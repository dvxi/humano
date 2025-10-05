'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Activity, BarChart3, Home, Users, Zap, Calendar, User, LogOut } from 'lucide-react';
import { Role } from '@prisma/client';

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string;
    image?: string | null;
    role: Role;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/activity', label: 'Activity', icon: Activity },
    { href: '/dashboard/history', label: 'History', icon: BarChart3 },
    { href: '/dashboard/reports', label: 'Reports', icon: Calendar },
    { href: '/dashboard/integrations', label: 'Integrations', icon: Zap },
    ...(user.role === 'USER'
      ? [{ href: '/dashboard/trainers', label: 'Trainers', icon: Users }]
      : []),
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-3xl font-bold font-[family-name:var(--font-noto-serif-hebrew)]"
          >
            H
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
