import Image from 'next/image';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { DocumentRecord, DocumentType } from '@/types';
import { DocumentActions } from './document-actions';

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

interface DocumentDetailProps {
  params: { id: string };
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailProps) {
  const profile = await getCurrentUserProfile();
  if (!profile?.institution_id) notFound();

  const supabase = createClient();
  const { data, error } = await supabase
    .from('documents')
    .select(
      'id, verification_code, institution_id, holder_name, document_type, title, document_number, file_hash, sealed_at, graduation_year, issue_date, status, revoked_at, revoked_reason, is_demo, created_by, created_at',
    )
    .eq('id', params.id)
    .eq('institution_id', profile.institution_id)
    .maybeSingle();

  if (error || !data) notFound();
  const document = data as DocumentRecord;

  const { count } = await supabase
    .from('verifications')
    .select('id', { count: 'exact', head: true })
    .eq('document_id', document.id);

  const code = document.verification_code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const verificationUrl = `${siteUrl}/verify/${code}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 1024,
  });

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body * { visibility: hidden; }
          #document-print-sheet, #document-print-sheet * { visibility: visible; }
          #document-print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {document.status === 'revoked' && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive">
          <p className="font-semibold">Document révoqué</p>
          <p className="mt-1 text-sm">
            Révoqué le {formatDate(document.revoked_at)} — Motif : {document.revoked_reason}
          </p>
        </div>
      )}

      <section id="document-print-sheet">
        <div className="hidden print:block">
          <p className="text-sm">{profile.institution?.name}</p>
          <h1 className="text-2xl font-bold">{documentTypeLabels[document.document_type]}</h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>Détails du document</CardTitle>
                <Badge
                  className={
                    document.status === 'valid'
                      ? 'border-transparent bg-success text-success-foreground'
                      : 'border-transparent bg-destructive text-destructive-foreground'
                  }
                >
                  {document.status === 'valid' ? 'Valide' : 'Révoqué'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Titulaire</p>
                <p className="mt-1 font-medium">{document.holder_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="mt-1 font-medium">{documentTypeLabels[document.document_type]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Intitulé du document</p>
                <p className="mt-1 font-medium">{document.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Numéro du document</p>
                <p className="mt-1 font-medium">{document.document_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Année d’obtention</p>
                <p className="mt-1 font-medium">{document.graduation_year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date d’émission</p>
                <p className="mt-1 font-medium">{formatDate(document.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Code de vérification</p>
                <p className="mt-1 font-mono font-medium">{formatCode(code)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vérifications</p>
                <p className="mt-1 font-medium">{count ?? 0}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Sceau numérique</p>
                {document.file_hash && document.sealed_at ? (
                  <p className="mt-1 font-medium">
                    Scellé numériquement le {formatDate(document.sealed_at)} —
                    empreinte : {document.file_hash.slice(0, 16)}
                  </p>
                ) : document.file_hash ? (
                  <p className="mt-1 font-medium">
                    Scellé numériquement — empreinte : {document.file_hash.slice(0, 16)}
                  </p>
                ) : (
                  <p className="mt-1 font-medium">
                    Document papier (sans fichier scellé)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full lg:w-80">
            <CardHeader>
              <CardTitle>QR code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="print:h-[5cm] print:w-[5cm]">
                <Image
                  src={qrDataUrl}
                  alt={`QR code de vérification du document ${formatCode(code)}`}
                  width={1024}
                  height={1024}
                  unoptimized
                  className="h-auto w-full print:h-[5cm] print:w-[5cm]"
                />
              </div>
              <p className="mt-3 break-all text-center font-mono text-sm">{formatCode(code)}</p>
              <p className="mt-2 hidden text-center text-xs print:block">
                Vérifiez l&apos;authenticité sur {siteUrl}/verify
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-6">
        <DocumentActions
          documentId={document.id}
          status={document.status}
          verificationCode={code}
          verificationUrl={verificationUrl}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </>
  );
}
