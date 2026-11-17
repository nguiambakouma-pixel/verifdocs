import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { VerificationResultCard } from '@/components/verification-result-card';
import { createClient } from '@/lib/supabase/server';
import type { DocumentType, VerificationResult } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function normalizeCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
}

function getRow(data: unknown): Record<string, unknown> | null {
  if (Array.isArray(data)) {
    return data.length > 0 && typeof data[0] === 'object'
      ? (data[0] as Record<string, unknown>)
      : null;
  }
  return typeof data === 'object' && data !== null
    ? (data as Record<string, unknown>)
    : null;
}

function parseResult(data: unknown): VerificationResult | null {
  const row = getRow(data);
  if (!row) return null;
  const result = row.result;
  if (result !== 'authentic' && result !== 'revoked' && result !== 'not_found') {
    return null;
  }
  return {
    result,
    holder_name: typeof row.holder_name === 'string' ? row.holder_name : undefined,
    document_type:
      typeof row.document_type === 'string'
        ? (row.document_type as DocumentType)
        : undefined,
    title: typeof row.title === 'string' ? row.title : undefined,
    document_number:
      typeof row.document_number === 'string' ? row.document_number : undefined,
    graduation_year:
      typeof row.graduation_year === 'number' ? row.graduation_year : undefined,
    issue_date: typeof row.issue_date === 'string' ? row.issue_date : null,
    institution_name:
      typeof row.institution_name === 'string' ? row.institution_name : undefined,
    has_file: row.has_file === true,
    is_demo: row.is_demo === true,
  };
}

export default async function VerifyDocumentPage({
  params,
}: {
  params: { code: string };
}) {
  const code = normalizeCode(params.code);
  const supabase = createClient();
  if (!code) {
    return (
      <VerificationLayout>
        <VerificationResultCard verification={{ result: 'not_found' }} fromCode />
      </VerificationLayout>
    );
  }

  const { data, error } = await supabase.rpc('verify_document', { p_code: code });
  if (error) {
    return (
      <VerificationLayout>
        <VerificationResultCard verification={null} unavailable />
      </VerificationLayout>
    );
  }

  return (
    <VerificationLayout>
      <VerificationResultCard verification={parseResult(data)} fromCode />
    </VerificationLayout>
  );
}

function VerificationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-grid px-4 py-16 sm:py-20">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
