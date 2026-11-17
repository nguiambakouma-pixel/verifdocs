'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse e-mail valide.'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

type LoginValues = z.infer<typeof loginSchema>;

function getSafeNextPath(path: string | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return null;
  }

  return path;
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error || !data.user) {
      setServerError('Email ou mot de passe incorrect');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      const { error: signOutError } = await supabase.auth.signOut();
      setServerError(
        signOutError
          ? 'Impossible de charger votre profil ou de fermer la session. Rechargez la page.'
          : 'Impossible de charger votre profil. Contactez l’administrateur.',
      );
      return;
    }

    const defaultPath = profile.role === 'super_admin' ? '/admin' : '/dashboard';
    router.refresh();
    router.replace(getSafeNextPath(nextPath) ?? defaultPath);
  }

  return (
    <form className="mt-8 space-y-5 text-left" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label
          className="mb-2 block text-sm font-medium text-foreground"
          htmlFor="email"
        >
          Adresse e-mail
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nom@exemple.fr"
            className="pl-10"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-foreground"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="pl-10"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="mt-2 text-sm text-destructive"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Les comptes sont créés par l&apos;administrateur de la plateforme.
      </p>
    </form>
  );
}
