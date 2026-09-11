'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import { useLocale } from '@/components/locale';
import StudioPanels from '@/components/studio-panels';

export function NotFoundPage() {
  const { t } = useLocale();
  const panelProgress = useRef(0);

  return (
    <section className="not-found-page">
      <div className="not-found-copy">
        <span className="not-found-code">404</span>
        <h1>
          {t.notFoundTitle1}
          <span>{t.notFoundTitle2}</span>
        </h1>
        <i aria-hidden="true" />
        <Link href="/" className="not-found-return">
          <ArrowLeft aria-hidden="true" />
          {t.backHome}
        </Link>
      </div>

      <div className="not-found-art" aria-hidden="true">
        <StudioPanels progress={panelProgress} mode="contact" />
      </div>

      <div className="not-found-signature" aria-hidden="true">
        <span>Carpintaria Pinto &amp; Pintos</span>
        <span>Desde 1975</span>
      </div>
    </section>
  );
}
