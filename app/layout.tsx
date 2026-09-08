import type { Metadata } from 'next';
import './globals.css';
import { Header, Footer } from '@/components/site';
export const metadata: Metadata = {
  title: 'Pinto & Pintos — Carpintaria à medida',
  description:
    'Projetamos, fabricamos e instalamos soluções de carpintaria à medida.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body>
        <a className="skip" href="#main">
          Saltar para o conteúdo
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
