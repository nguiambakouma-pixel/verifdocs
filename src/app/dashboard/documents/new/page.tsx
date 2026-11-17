import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm } from './document-form';

export default function NewDocumentPage() {
  return (
    <section>
      <Link
        href="/dashboard/documents"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux documents
      </Link>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Nouveau document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm />
        </CardContent>
      </Card>
    </section>
  );
}
