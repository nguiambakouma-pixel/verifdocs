'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VerificationResultCard } from '@/components/verification-result-card';
import type { DocumentType, VerificationResult } from '@/types';

async function sha256(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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

export function VerifyFilePanel() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasResult, setHasResult] = useState(false);

  async function handleFile(file: File | undefined) {
    setError(null);
    setResult(null);
    setHasResult(false);
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Veuillez déposer un fichier PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier PDF ne doit pas dépasser 10 Mo.');
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const hash = await sha256(bytes);
      const { data, error: rpcError } = await supabase.rpc('verify_file_hash', {
        p_hash: hash,
      });
      if (rpcError) {
        setError('Service momentanément indisponible');
        return;
      }

      const row = getRow(data);
      if (!row) {
        setHasResult(true);
        setResult({ result: 'not_found' });
        return;
      }
      const rpcResult = row.result;
      if (rpcResult !== 'authentic' && rpcResult !== 'revoked' && rpcResult !== 'not_found') {
        setError('Service momentanément indisponible');
        return;
      }
      setHasResult(true);
      setResult({
        result: rpcResult,
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
        has_file: true,
        is_demo: row.is_demo === true,
        verified_by: 'file',
      });
    } catch {
      setError('Ce fichier ne peut pas être lu.');
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        onDrop={(event) => {
          event.preventDefault();
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        onDragOver={(event) => event.preventDefault()}
        className="block w-full rounded-md border border-dashed border-border p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
      />
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>
      )}
      {hasResult && (
        <div className="mt-4">
          <VerificationResultCard verification={result} />
        </div>
      )}
    </div>
  );
}
