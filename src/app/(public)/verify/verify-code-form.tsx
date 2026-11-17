'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function VerifyCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <form
      className="mt-8 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const normalized = code
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 32);
        if (normalized) router.push(`/verify/${normalized}`);
      }}
    >
      <Input
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Code de vérification"
        aria-label="Code de vérification"
        className="font-mono"
        maxLength={48}
      />
      <Button type="submit">Vérifier</Button>
    </form>
  );
}
