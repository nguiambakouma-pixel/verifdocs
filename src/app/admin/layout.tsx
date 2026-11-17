import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { DashboardTopBar } from '@/components/dashboard-topbar';
import { getCurrentUserProfile } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopBar
        contextLabel="Administration"
        userName={profile.full_name}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
