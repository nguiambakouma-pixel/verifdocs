import { Zap, ShieldX, Building2, Eye } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Vérification rapide',
    description:
      "Résultat instantané dès le scan du QR code, sans attente ni procédure complexe.",
  },
  {
    icon: ShieldX,
    title: 'Protection contre les faux documents',
    description:
      "Chaque document possède un identifiant unique et infalsifiable, rendant la contrefaçon quasi impossible.",
  },
  {
    icon: Building2,
    title: "Identification de l'établissement émetteur",
    description:
      "VerifDocs affiche l'organisme qui a émis le document pour garantir sa provenance et sa légitimité.",
  },
  {
    icon: Eye,
    title: 'Consultation simple et accessible',
    description:
      "Une interface claire, accessible sur mobile comme sur ordinateur, pour vérifier un document en toute transparence.",
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            Avantages
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
            Pourquoi choisir VerifDocs
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Une solution pensée pour la confiance, la sécurité et la simplicité.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
