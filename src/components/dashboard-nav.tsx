'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { UserNav } from './user-nav';
import { Activity, BarChart3, Home, Users, Zap, Calendar } from 'lucide-react';
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
          <Link href="/dashboard" className="text-xl font-bold">
            Fitness App
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

        <UserNav user={user} />
      </div>
    </nav>
  );
}
