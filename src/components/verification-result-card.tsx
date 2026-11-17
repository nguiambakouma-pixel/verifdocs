import Link from 'next/link';
import type { VerificationResult } from '@/types';
import type { DocumentType } from '@/types';

const documentTypeLabels: Record<DocumentType, string> = {
  diplome: 'Diplôme',
  attestation: 'Attestation de réussite',
  releve_notes: 'Relevé de notes',
  certificat: 'Certificat',
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR').format(date);
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-semibold text-foreground">{value ?? '—'}</p>
    </div>
  );
}

export function VerificationResultCard({
  verification,
  unavailable = false,
  fromCode = false,
}: {
  verification: VerificationResult | null;
  unavailable?: boolean;
  fromCode?: boolean;
}) {
  if (unavailable) {
    return (
      <section className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-secondary">
          Service momentanément indisponible
        </h1>
      </section>
    );
  }

  if (!verification || verification.result === 'not_found') {
    if (verification?.verified_by === 'file') {
      return (
        <section className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-secondary">
            Document introuvable
          </h1>
          <p className="mt-3 text-muted-foreground">
            Ce fichier ne correspond à aucun document enregistré. Il a peut-être été
            modifié, ou ré-enregistré par un autre logiciel. Si le document porte un
            QR code, utilisez-le.
          </p>
        </section>
      );
    }

    return (
      <section className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-secondary">
          Document introuvable
        </h1>
        <p className="mt-3 text-muted-foreground">
          Aucun document ne correspond à ce code.
        </p>
      </section>
    );
  }

  if (verification.result === 'revoked') {
    const institution =
      verification.institution_name ?? verification.institution_short_name;
    const documentType = verification.document_type
      ? documentTypeLabels[verification.document_type]
      : 'Document';

    return (
      <section className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-card text-center shadow-xl">
        {verification.is_demo && (
          <span className="absolute right-3 top-3 rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-semibold text-warning-foreground">
            Données de test
          </span>
        )}
        <div className="border-b border-destructive/20 bg-destructive/10 px-6 py-5 text-destructive">
          <h1 className="text-2xl font-bold sm:text-3xl">Document révoqué</h1>
        </div>
        <div className="grid gap-5 p-6 text-left sm:grid-cols-2 sm:p-8">
          <Field label="Établissement" value={institution} />
          <Field label="Type de document" value={documentType} />
          <Field label="Intitulé" value={verification.title} />
          <Field label="Numéro du document" value={verification.document_number} />
        </div>
        <p className="border-t border-destructive/20 px-6 py-5 text-sm text-destructive">
          Ce document a été révoqué par l’établissement émetteur.
        </p>
      </section>
    );
  }

  const institution =
    verification.institution_name ?? verification.institution_short_name;
  const documentType = verification.document_type
    ? documentTypeLabels[verification.document_type]
    : 'Document';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-success/30 bg-card shadow-xl">
      {verification.is_demo && (
        <span className="absolute right-3 top-3 rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-semibold text-warning-foreground">
          Données de test
        </span>
      )}
      <div className="border-b border-success/20 bg-success/10 px-6 py-5 text-center text-success">
        <h1 className="text-2xl font-bold sm:text-3xl">Document authentique</h1>
      </div>
      <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <Field label="Titulaire" value={verification.holder_name} />
        <Field label="Type de document" value={documentType} />
        <Field label="Intitulé du document" value={verification.title} />
        <Field label="Numéro du document" value={verification.document_number} />
        <Field
          label="Année d’obtention"
          value={
            verification.graduation_year
              ? String(verification.graduation_year)
              : undefined
          }
        />
        <Field label="Établissement" value={institution} />
        <Field
          label="Date d’émission"
          value={formatDate(verification.issue_date)}
        />
      </div>
      {fromCode && verification.has_file && (
        <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
          Ce document dispose d&apos;un sceau numérique : pour une vérification
          complète, déposez le fichier PDF reçu sur la page{' '}
          <Link href="/verify" className="font-medium text-primary underline">
            Vérifier
          </Link>
          .
        </div>
      )}
      <p className="border-t border-border bg-muted/40 px-6 py-5 text-sm leading-relaxed text-muted-foreground sm:px-8">
        Comparez ces informations avec le document qui vous est présenté.
        Si elles diffèrent, le document n’est pas authentique.
      </p>
    </section>
  );
}
