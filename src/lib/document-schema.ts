import { z } from 'zod';

const currentYear = new Date().getFullYear();

function cleanSpaces(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export const documentSchema = z.object({
  holder_name: z
    .string()
    .transform(cleanSpaces)
    .pipe(z.string().min(2, 'Le nom du titulaire doit contenir au moins 2 caractères.')
      .max(120, 'Le nom du titulaire ne peut pas dépasser 120 caractères.')),
  document_type: z.enum(
    ['diplome', 'attestation', 'releve_notes', 'certificat'],
    { errorMap: () => ({ message: 'Sélectionnez un type de document.' }) },
  ),
  title: z
    .string()
    .transform(cleanSpaces)
    .pipe(z.string().min(2, 'L’intitulé du document doit contenir au moins 2 caractères.')
      .max(200, 'L’intitulé du document ne peut pas dépasser 200 caractères.')),
  document_number: z
    .string()
    .transform(cleanSpaces)
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().max(60, 'Le numéro du document ne peut pas dépasser 60 caractères.').optional()),
  graduation_year: z.coerce
    .number()
    .int('L’année d’obtention doit être un entier.')
    .min(1950, 'L’année d’obtention doit être au moins 1950.')
    .max(currentYear + 1, `L’année d’obtention ne peut pas dépasser ${currentYear + 1}.`),
  issue_date: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() ? value : undefined)),
});

export type DocumentFormValues = z.input<typeof documentSchema>;
