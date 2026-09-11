'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer, Header } from '@/components/site';
import { useLocale } from '@/components/locale';

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const admin = pathname.startsWith('/admin');
  if (admin) return <main id="main">{children}</main>;
  return (
    <>
      <a className="skip" href="#main">
        {t.skipToContent}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
