'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { documentSchema } from '@/lib/document-schema';
import { createDocument, sealDocument } from '../actions';

type FormValues = z.input<typeof documentSchema>;

const documentTypes = [
  { value: 'diplome', label: 'Diplôme', placeholder: 'Ex. Licence professionnelle en Génie logiciel' },
  { value: 'attestation', label: 'Attestation de réussite', placeholder: 'Ex. Attestation de réussite – Master 1 Droit' },
  { value: 'releve_notes', label: 'Relevé de notes', placeholder: 'Ex. Relevé de notes – Semestre 1, 2024/2025' },
  { value: 'certificat', label: 'Certificat', placeholder: 'Ex. Certificat de formation en comptabilité' },
] as const;

async function sha256(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function DocumentForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'pdf' | 'paper'>('pdf');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right'>('bottom-right');
  const [pageChoice, setPageChoice] = useState<'first' | 'last'>('first');
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingPdf, setPendingPdf] = useState<Uint8Array | null>(null);
  const [pendingSeal, setPendingSeal] = useState<{ id: string; name: string } | null>(null);
  const currentYear = new Date().getFullYear();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(documentSchema),
  });

  const documentType = watch('document_type');
  const holderName = watch('holder_name') ?? '';
  const titlePlaceholder =
    documentTypes.find((type) => type.value === documentType)?.placeholder ??
    'Ex. Intitulé du document';

  function handlePdfDrop(file: File | undefined) {
    setServerError(null);
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setServerError('Veuillez déposer un fichier PDF.');
      setPdfFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setServerError('Le fichier PDF ne doit pas dépasser 10 Mo.');
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  }

  function downloadSealedPdf(bytes: Uint8Array, fileName: string) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function retrySeal() {
    if (!pendingPdf || !pendingSeal) return;
    setServerError(null);
    const hash = await sha256(pendingPdf);
    const result = await sealDocument(pendingSeal.id, hash);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    downloadSealedPdf(pendingPdf, pendingSeal.name);
    setPendingPdf(null);
    setPendingSeal(null);
    router.push(`/dashboard/documents/${pendingSeal.id}`);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setPendingPdf(null);
    setPendingSeal(null);

    if (mode === 'pdf' && !pdfFile) {
      setServerError('Veuillez déposer un fichier PDF.');
      return;
    }

    const formData = new FormData();
    formData.set('holder_name', values.holder_name);
    formData.set('document_type', values.document_type);
    formData.set('title', values.title);
    if (values.document_number) formData.set('document_number', values.document_number);
    formData.set('graduation_year', String(values.graduation_year));
    if (values.issue_date) formData.set('issue_date', values.issue_date);

    let pdfDoc: PDFDocument | null = null;
    if (mode === 'pdf') {
      try {
        if (!pdfFile) return;
        const sourceBytes = new Uint8Array(await pdfFile.arrayBuffer());
        pdfDoc = await PDFDocument.load(sourceBytes, {
          ignoreEncryption: false,
          updateMetadata: false,
        });
        if (pdfDoc.getPages().length === 0) throw new Error('EMPTY_PDF');
      } catch {
        setServerError('Ce PDF est protégé ou illisible');
        return;
      }
    }

    const result = await createDocument(formData);
    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (mode === 'paper') {
      router.push(`/dashboard/documents/${result.id}`);
      return;
    }

    try {
      if (!pdfDoc) return;
      const pages = pdfDoc.getPages();
      if (pages.length === 0) throw new Error('EMPTY_PDF');

      const page = pageChoice === 'last' ? pages[pages.length - 1] : pages[0];
      const code = result.verification_code
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 32);
      const formattedCode = code.match(/.{1,4}/g)?.join('-') ?? code;
      const siteUrl = (
        process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      ).replace(/\/$/, '');
      const verificationUrl = `${siteUrl}/verify/${code}`;
      const domain = new URL(siteUrl).host;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256,
      });
      const qrImage = await pdfDoc.embedPng(qrDataUrl);
      const qrSize = 62;
      const margin = 18;
      const { width, height } = page.getSize();
      let x = width - qrSize - margin;
      let y = margin;
      if (position === 'bottom-left') x = margin;
      if (position === 'top-right') y = height - qrSize - margin;

      page.drawImage(qrImage, { x, y, width: qrSize, height: qrSize });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const smallText = `Vérifier : ${domain}/verify`;
      const codeText = `Code : ${formattedCode}`;
      page.drawText(smallText, {
        x: x > 0 ? x : margin,
        y: y - 20,
        size: 7,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
      page.drawText(codeText, {
        x: x > 0 ? x : margin,
        y: y - 31,
        size: 7,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });

      const sealedBytes = await pdfDoc.save();
      const hash = await sha256(sealedBytes);
      const sealResult = await sealDocument(result.id, hash);
      if (sealResult.error) {
        const safeHolder = (values.holder_name ?? 'document')
          .trim()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        setPendingPdf(sealedBytes);
        setPendingSeal({ id: result.id, name: `${safeHolder}_${code}.pdf` });
        setServerError(sealResult.error);
        return;
      }

      const safeHolder = (values.holder_name ?? 'document')
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      downloadSealedPdf(sealedBytes, `${safeHolder}_${code}.pdf`);
      router.push(`/dashboard/documents/${result.id}`);
    } catch {
      setServerError('Ce PDF est protégé ou illisible');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'pdf' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
        >
          Document PDF — apposer le sceau numérique
        </button>
        <button
          type="button"
          onClick={() => setMode('paper')}
          className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'paper' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
        >
          Document papier — QR code à imprimer (sans fichier)
        </button>
      </div>

      {serverError && (
        <div className="rounded-md bg-destructive/10 px-3 py-3 text-sm text-destructive" role="alert">
          {serverError}
          {pendingPdf && pendingSeal && (
            <Button type="button" variant="outline" size="sm" className="mt-3 block" onClick={retrySeal}>
              Réessayer
            </Button>
          )}
        </div>
      )}

      {mode === 'pdf' && (
        <div className="space-y-4 rounded-lg border border-dashed border-border p-5">
          <label className="block text-sm font-medium" htmlFor="pdf-file">
            Fichier PDF
          </label>
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => handlePdfDrop(event.target.files?.[0])}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handlePdfDrop(event.dataTransfer.files?.[0]);
            }}
            className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
          />
          {pdfFile && <p className="text-sm text-muted-foreground">{pdfFile.name}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Position du sceau</label>
              <Select value={position} onValueChange={(value) => setPosition(value as typeof position)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bas-droite</SelectItem>
                  <SelectItem value="bottom-left">Bas-gauche</SelectItem>
                  <SelectItem value="top-right">Haut-droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Page</label>
              <Select value={pageChoice} onValueChange={(value) => setPageChoice(value as typeof pageChoice)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">Première</SelectItem>
                  <SelectItem value="last">Dernière</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="holder_name">Nom du titulaire</label>
        <Input id="holder_name" {...register('holder_name')} />
        {errors.holder_name && <p className="mt-2 text-sm text-destructive">{errors.holder_name.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Type de document</label>
        <Select value={watch('document_type')} onValueChange={(value) => setValue('document_type', value as FormValues['document_type'], { shouldValidate: true })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.document_type && <p className="mt-2 text-sm text-destructive">{errors.document_type.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="title">Intitulé du document</label>
        <Input id="title" placeholder={titlePlaceholder} {...register('title')} />
        {errors.title && <p className="mt-2 text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="document_number">Numéro du document (facultatif)</label>
        <Input id="document_number" maxLength={60} {...register('document_number')} />
        <p className="mt-1 text-xs text-muted-foreground">tel qu&apos;imprimé sur le document</p>
        {errors.document_number && <p className="mt-2 text-sm text-destructive">{errors.document_number.message}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="graduation_year">Année d’obtention</label>
          <Input id="graduation_year" type="number" min={1950} max={currentYear + 1} {...register('graduation_year', { valueAsNumber: true })} />
          {errors.graduation_year && <p className="mt-2 text-sm text-destructive">{errors.graduation_year.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="issue_date">Date d’émission (facultative)</label>
          <Input id="issue_date" type="date" {...register('issue_date')} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Création en cours…' : mode === 'pdf' ? 'Créer et sceller le PDF' : 'Créer le document papier'}
      </Button>
      {mode === 'pdf' && (
        <p className="text-xs text-muted-foreground">
          Le fichier n&apos;est pas conservé par la plateforme : conservez précieusement le PDF scellé.
        </p>
      )}
    </form>
  );
}
