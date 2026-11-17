import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LoginForm } from './login-form';

interface LoginPageProps {
  searchParams?: {
    next?: string | string[];
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawNextPath = searchParams?.next;
  const nextPath = Array.isArray(rawNextPath)
    ? rawNextPath[0]
    : rawNextPath;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-grid px-4 py-20">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Espace établissement
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Connectez-vous pour gérer les documents officiels de votre
            établissement.
          </p>

          <LoginForm nextPath={nextPath} />

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
