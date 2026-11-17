import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const footerLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                VerifDocs
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-secondary-foreground/70">
              Plateforme de vérification et d&apos;authentification de documents
              officiels par QR code, conçue pour les universités,
              administrations et entreprises.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60">
              Navigation
            </span>
            <ul className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-secondary-foreground/15 pt-6">
          <p className="text-center text-sm text-secondary-foreground/60 md:text-left">
            © 2026 VerifDocs. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
