import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile?.institution_id) {
    return null;
  }

  const supabase = createClient();
  const [{ count: total }, { count: valid }, { count: revoked }] =
    await Promise.all([
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id),
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id)
        .eq('status', 'valid'),
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', profile.institution_id)
        .eq('status', 'revoked'),
    ]);

  const { data: documents } = await supabase
    .from('documents')
    .select('id')
    .eq('institution_id', profile.institution_id);

  const documentIds = documents?.map((document) => document.id) ?? [];
  let verificationCount = 0;
  if (documentIds.length > 0) {
    const { count } = await supabase
      .from('verifications')
      .select('id', { count: 'exact', head: true })
      .in('document_id', documentIds);
    verificationCount = count ?? 0;
  }

  const stats = [
    { title: 'Total des documents', value: total ?? 0 },
    { title: 'Documents valides', value: valid ?? 0 },
    { title: 'Documents révoqués', value: revoked ?? 0 },
    { title: 'Nombre de vérifications', value: verificationCount },
  ];

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary">
            Tableau de bord
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérez les documents de votre établissement.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/documents/new">Nouveau document</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Voir les documents</Link>
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-secondary">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
