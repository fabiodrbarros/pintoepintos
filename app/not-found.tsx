import type { Metadata } from 'next';
import { NotFoundPage } from '@/components/not-found-page';
import { siteName } from '@/lib/site-metadata';

const title = `Página não encontrada | ${siteName}`;
const description = 'A página que procura não existe ou foi movida.';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    siteName,
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function NotFound() {
  return <NotFoundPage />;
}
