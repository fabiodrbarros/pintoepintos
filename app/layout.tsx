import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { LocaleProvider } from '@/components/locale';
import type { Locale } from '@/lib/cms-types';
import { homeTitle, siteName, siteUrl } from '@/lib/site-metadata';

const description =
  'Projetamos, fabricamos e instalamos soluções de carpintaria à medida.';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: homeTitle,
    template: `%s | ${siteName}`,
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: homeTitle,
    description,
    url: '/',
    siteName,
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: homeTitle,
    description,
  },
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
