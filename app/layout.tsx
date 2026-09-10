import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { LocaleProvider } from '@/components/locale';
import type { Locale } from '@/lib/cms-types';
export const metadata: Metadata = {
  title: 'Pinto & Pintos — Carpintaria à medida',
  description:
    'Projetamos, fabricamos e instalamos soluções de carpintaria à medida.',
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedLocale = (await cookies()).get('pintos_locale')?.value;
  const locale: Locale = savedLocale === 'en' || savedLocale === 'fr' ? savedLocale : 'pt';
  return (
    <html lang={locale === 'pt' ? 'pt-PT' : locale}>
      <body>
        <LocaleProvider initialLocale={locale}><SiteShell>{children}</SiteShell></LocaleProvider>
      </body>
    </html>
  );
}
