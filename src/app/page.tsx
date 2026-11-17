import Link from 'next/link';
import { ShieldCheck, QrCode, Building2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroIllustration } from '@/components/hero-illustration';
import { HowItWorks } from '@/components/how-it-works';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="animate-fade-in text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Authentification de documents officiels
                </span>
                <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                  Vos documents, vérifiés en toute confiance.
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                  VerifDocs permet de vérifier l&apos;authenticité des
                  documents grâce à un système de QR codes uniques, pensé pour
                  les universités, administrations et entreprises.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    href="/verify"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg sm:w-auto"
                  >
                    <QrCode className="h-5 w-5" />
                    Vérifier un document
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-7 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-accent sm:w-auto"
                  >
                    <Building2 className="h-5 w-5" />
                    Espace établissement
                  </Link>
                </div>
              </div>

              <div className="mt-8 lg:mt-0">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Features />

        {/* About */}
        <section id="about" className="border-t border-border/60 bg-card/50 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              À propos
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              Une plateforme pensée pour la confiance
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              VerifDocs est une plateforme technologique dédiée à la vérification
              et à l&apos;authentification de documents officiels. Conçue pour
              les universités, les administrations et les entreprises, elle
              repose sur un système de QR codes uniques permettant à tout
              destinataire de confirmer en quelques secondes la légitimité
              d&apos;un diplôme, d&apos;une attestation ou d&apos;un certificat.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/verify"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                Vérifier un document
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground transition-all hover:bg-accent"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
