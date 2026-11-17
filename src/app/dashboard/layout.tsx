import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AccountNotice } from '@/components/account-notice';
import { DashboardTopBar } from '@/components/dashboard-topbar';
import { getCurrentUserProfile } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'super_admin') {
    redirect('/admin');
  }

  if (!profile.institution_id) {
    return (
      <AccountNotice
        title="Compte non rattaché à un établissement"
        description="Contactez l’administrateur de la plateforme pour rattacher votre compte à un établissement."
      />
    );
  }

  if (profile.institution?.status !== 'approved') {
    return (
      <AccountNotice
        title="Votre établissement est en attente de validation"
        description="Les fonctionnalités seront accessibles après validation de votre établissement par l’administrateur."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopBar
        contextLabel={profile.institution.name}
        userName={profile.full_name}
        showDocumentsLink
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
