import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { ProfileWithInstitution } from '@/types';

export async function getCurrentUserProfile(): Promise<ProfileWithInstitution | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && userError.name !== 'AuthSessionMissingError') {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, full_name, role, institution_id, institution:institutions (id, name, short_name, city, status)',
    )
    .eq('id', user.id)
    .returns<ProfileWithInstitution>()
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error('Profil Supabase introuvable pour cet utilisateur.');
  }

  return profile;
}
