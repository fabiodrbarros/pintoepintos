import type { Metadata } from 'next';

export const siteName = 'Carpintaria Pinto & Pintos';
export const homeTitle =
  'Carpintaria Pinto & Pintos - Qualidade, tradição e detalhe em cada peça.';
export const siteUrl = new URL('https://carpintariapintos.fabiodrbarros.cloud');

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const sharedTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: sharedTitle,
      description,
      url: path,
      siteName,
      locale: 'pt_PT',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: sharedTitle,
      description,
    },
  };
}
