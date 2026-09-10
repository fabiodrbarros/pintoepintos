import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestão de conteúdos — Pinto & Pintos',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
