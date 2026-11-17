import Link from 'next/link';
import { QrCode, ScanLine, FileCheck2, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: FileCheck2,
    number: '01',
    title: "L'établissement enregistre le document",
    description:
      "L'organisme émetteur sécurise un document officiel et génère un QR code unique qui lui est rattaché.",
  },
  {
    icon: QrCode,
    number: '02',
    title: "L'utilisateur scanne le QR code",
    description:
      "Avec un smartphone ou une webcam, le détenteur du document scanne le QR code pour lancer la vérification.",
  },
  {
    icon: ScanLine,
    number: '03',
    title: 'VerifDocs affiche le résultat',
    description:
      "La plateforme indique instantanément si le document est authentique et présente l'établissement émetteur.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border/60 bg-card/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            Comment ça marche
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
            Trois étapes simples
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            De l&apos;enregistrement à la vérification, le processus est rapide
            et accessible à tous.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="group h-full rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-border">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-border md:block">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
