import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const upcomingFeatures = [
  { title: 'Gestion des établissements', description: 'À venir' },
  { title: 'Gestion des comptes', description: 'À venir' },
  { title: 'Journal d’audit', description: 'À venir' },
];

export default function AdminPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-secondary">
        Administration
      </h1>
      <p className="mt-2 text-muted-foreground">
        Gérez la plateforme VerifDocs.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {upcomingFeatures.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
