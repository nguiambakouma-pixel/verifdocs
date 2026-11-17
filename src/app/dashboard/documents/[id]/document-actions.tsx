'use client';

import { useState } from 'react';
import { Download, Printer, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { revokeDocument } from '../actions';

interface DocumentActionsProps {
  documentId: string;
  status: 'valid' | 'revoked';
  verificationCode: string;
  verificationUrl: string;
  qrDataUrl: string;
}

export function DocumentActions({
  documentId,
  status,
  verificationCode,
  verificationUrl,
  qrDataUrl,
}: DocumentActionsProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function downloadQr() {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${verificationCode}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(verificationUrl);
  }

  async function revoke() {
    setError(null);
    if (reason.trim().replace(/\s+/g, ' ').length < 5) {
      setError('Le motif doit contenir au moins 5 caractères.');
      return;
    }

    setSubmitting(true);
    const result = await revokeDocument(documentId, reason);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <Button type="button" variant="outline" onClick={downloadQr}>
        <Download className="mr-2 h-4 w-4" />
        Télécharger le QR (PNG)
      </Button>
      <Button type="button" variant="outline" onClick={copyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copier le lien
      </Button>
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimer la fiche
      </Button>

      {status === 'valid' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Révoquer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Révoquer ce document ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action rendra le document non valide lors de sa vérification.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="revocation-reason">
                Motif
              </label>
              <Input
                id="revocation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Expliquez le motif de la révocation"
              />
              {error && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                onClick={revoke}
                disabled={submitting}
              >
                {submitting ? 'Révocation…' : 'Confirmer la révocation'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
