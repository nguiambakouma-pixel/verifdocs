import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardTopBarProps {
  contextLabel: string;
  userName: string;
  showDocumentsLink?: boolean;
}

export function DashboardTopBar({
  contextLabel,
  userName,
  showDocumentsLink = false,
}: DashboardTopBarProps) {
  return (
    <header className="border-b border-border/60 bg-background/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-secondary">
            VerifDocs
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {showDocumentsLink && (
            <Link
              href="/dashboard/documents"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Documents
            </Link>
          )}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">{contextLabel}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>
          <form method="post" action="/auth/signout">
            <Button type="submit" variant="outline" size="sm">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
