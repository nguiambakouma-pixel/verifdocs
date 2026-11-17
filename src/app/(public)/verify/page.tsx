import { ArrowLeft, QrCode, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { VerifyCodeForm } from './verify-code-form';
import { VerifyFilePanel } from './verify-file-panel';

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center bg-grid px-4 py-20">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <QrCode className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Vérification de document
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Saisissez le code imprimé sur le document pour vérifier son
            authenticité.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">Saisir un code</h2>
              <VerifyCodeForm />
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">Vérifier un fichier PDF</h2>
              <VerifyFilePanel />
            </section>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <ScanLine className="h-4 w-4" />
            Vous pouvez aussi scanner le QR code avec l&apos;appareil photo de votre téléphone.
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
