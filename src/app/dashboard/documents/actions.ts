'use server';

import { revalidatePath } from 'next/cache';
import { documentSchema } from '@/lib/document-schema';
import { getCurrentUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function createDocument(formData: FormData) {
  const parsed = documentSchema.safeParse({
    holder_name: formData.get('holder_name'),
    document_type: formData.get('document_type'),
    title: formData.get('title'),
    document_number: formData.get('document_number') || undefined,
    graduation_year: formData.get('graduation_year'),
    issue_date: formData.get('issue_date') || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? 'Veuillez vérifier les informations saisies.',
    };
  }

  const profile = await getCurrentUserProfile();
  if (!profile || !profile.institution_id) {
    return { error: 'Compte non rattaché à un établissement.' };
  }

  const supabase = createClient();
  const { data: document, error } = await supabase
    .from('documents')
    .insert({
      institution_id: profile.institution_id,
      created_by: profile.id,
      holder_name: parsed.data.holder_name,
      document_type: parsed.data.document_type,
      title: parsed.data.title,
      document_number: parsed.data.document_number ?? null,
      graduation_year: parsed.data.graduation_year,
      issue_date: parsed.data.issue_date ?? null,
    })
    .select('id, verification_code')
    .single();

  if (error || !document) {
    return { error: 'Impossible de créer le document.' };
  }

  revalidatePath('/dashboard/documents');
  return { id: document.id, verification_code: document.verification_code };
}

export async function revokeDocument(documentId: string, reason: string) {
  const cleanedReason = reason.trim().replace(/\s+/g, ' ');
  if (cleanedReason.length < 5) {
    return { error: 'Le motif doit contenir au moins 5 caractères.' };
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.institution_id) {
    return { error: 'Compte non rattaché à un établissement.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('documents')
    .update({
      status: 'revoked',
      revoked_reason: cleanedReason,
    })
    .eq('id', documentId)
    .eq('institution_id', profile.institution_id)
    .eq('status', 'valid');

  if (error) {
    return { error: 'Impossible de révoquer le document.' };
  }

  revalidatePath(`/dashboard/documents/${documentId}`);
  revalidatePath('/dashboard/documents');
  return { success: true };
}

export async function sealDocument(documentId: string, hash: string) {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return { error: 'Empreinte SHA-256 invalide.' };
  }

  const profile = await getCurrentUserProfile();
  if (!profile?.institution_id) {
    return { error: 'Compte non rattaché à un établissement.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('documents')
    .update({ file_hash: hash })
    .eq('id', documentId)
    .eq('institution_id', profile.institution_id)
    .is('file_hash', null);

  if (error) {
    return { error: 'Impossible d’enregistrer l’empreinte du document.' };
  }

  revalidatePath(`/dashboard/documents/${documentId}`);
  revalidatePath('/dashboard/documents');
  return { success: true };
}
