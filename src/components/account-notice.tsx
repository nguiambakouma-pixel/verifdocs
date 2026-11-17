import { Button } from '@/components/ui/button';

interface AccountNoticeProps {
  title: string;
  description: string;
}

export function AccountNotice({ title, description }: AccountNoticeProps) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grid px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <form className="mt-8" method="post" action="/auth/signout">
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </section>
    </main>
  );
}
