'use client';

import Link from 'next/link';
import { useLocale } from '@/components/locale';
export default function NotFound() {
  const { t } = useLocale();
  return (
    <section className="section page-intro">
      <p>404</p>
      <h1>
        {t.notFoundTitle1}
        <br />
        {t.notFoundTitle2}
      </h1>
      <Link href="/" className="text-link">
        {t.backHome} →
      </Link>
    </section>
  );
}
