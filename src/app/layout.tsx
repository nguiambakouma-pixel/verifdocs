import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'VerifDocs — Vérification et authentification de documents officiels',
  description:
    "VerifDocs permet de vérifier l'authenticité des documents officiels grâce à un système de QR codes uniques. Une plateforme de confiance pour les universités, administrations et entreprises.",
  openGraph: {
    title: 'VerifDocs — Vérification et authentification de documents officiels',
    description:
      "Vérifiez l'authenticité de vos documents officiels grâce à des QR codes uniques et sécurisés.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
