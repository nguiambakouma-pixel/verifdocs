import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth';
import type { DocumentRecord, DocumentType } from '@/types';
import { LockKeyhole, QrCode } from 'lucide-react';

export const dynamic = 'force-dynamic';

const documentTypeLabels: Record<DocumentType, string> = {
  diplome: 'Diplôme',
  attestation: 'Attestation de réussite',
  releve_notes: 'Relevé de notes',
  certificat: 'Certificat',
};

function formatCode(code: string) {
  return code.match(/.{1,4}/g)?.join('-') ?? code;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

interface DocumentsPageProps {
  searchParams?: {
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  };
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const profile = await getCurrentUserProfile();
  if (!profile?.institution_id) return null;

  const qRawValue = searchParams?.q;
  const statusRawValue = searchParams?.status;
  const pageRawValue = searchParams?.page;
  const qRaw = Array.isArray(qRawValue) ? qRawValue[0] : qRawValue;
  const statusRaw = Array.isArray(statusRawValue)
    ? statusRawValue[0]
    : statusRawValue;
  const pageRaw = Array.isArray(pageRawValue)
    ? pageRawValue[0]
    : pageRawValue;
  const q = qRaw?.trim().slice(0, 100) ?? '';
  const status =
    statusRaw === 'valid' || statusRaw === 'revoked' ? statusRaw : undefined;
  const page = Math.max(1, Number.parseInt(pageRaw ?? '1', 10) || 1);
  const pageSize = 20;

  const supabase = createClient();
  let query = supabase
    .from('documents')
    .select(
      'id, verification_code, institution_id, holder_name, document_type, title, document_number, file_hash, sealed_at, graduation_year, issue_date, status, revoked_at, revoked_reason, is_demo, created_by, created_at',
      { count: 'exact' },
    )
    .eq('institution_id', profile.institution_id);

  if (q) {
    const safeQuery = q.replace(/[%_,()]/g, ' ');
    query = query.or(
      `holder_name.ilike.%${safeQuery}%,verification_code.ilike.%${safeQuery}%,title.ilike.%${safeQuery}%`,
    );
  }
  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    throw error;
  }

  const documents = (data ?? []) as DocumentRecord[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const preservedParams = new URLSearchParams();
  if (q) preservedParams.set('q', q);
  if (status) preservedParams.set('status', status);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary">
            Documents
          </h1>
          <p className="mt-2 text-muted-foreground">
            Documents émis par {profile.institution?.name}.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/new">Nouveau document</Link>
        </Button>
      </div>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" method="get">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou code"
          className="sm:max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="valid">Valide</option>
          <option value="revoked">Révoqué</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
      </form>

      {documents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-secondary">
            Aucun document enregistré
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez le premier document pour générer son QR code de vérification.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/documents/new">Nouveau document</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d’émission</TableHead>
                <TableHead>Sceau</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/documents/${document.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {document.holder_name}
                    </Link>
                  </TableCell>
                  <TableCell>{documentTypeLabels[document.document_type]}</TableCell>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>{document.graduation_year}</TableCell>
                  <TableCell className="font-mono">
                    {formatCode(document.verification_code)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        document.status === 'valid'
                          ? 'border-transparent bg-success text-success-foreground'
                          : 'border-transparent bg-destructive text-destructive-foreground'
                      }
                    >
                      {document.status === 'valid' ? 'Valide' : 'Révoqué'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(document.issue_date)}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex"
                      title={document.file_hash ? 'PDF scellé' : 'Document papier'}
                    >
                      {document.file_hash ? (
                        <LockKeyhole className="h-4 w-4 text-primary" />
                      ) : (
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/dashboard/documents?${new URLSearchParams({
                  ...Object.fromEntries(preservedParams),
                  page: String(page - 1),
                })}`}
              >
                Précédent
              </Link>
            </Button>
          ) : <span />}
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/dashboard/documents?${new URLSearchParams({
                  ...Object.fromEntries(preservedParams),
                  page: String(page + 1),
                })}`}
              >
                Suivant
              </Link>
            </Button>
          ) : <span />}
        </nav>
      )}
    </section>
  );
}
