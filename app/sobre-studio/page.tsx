import type { Metadata } from 'next';
import { AboutStudioPage } from '@/components/about-studio';

export const metadata: Metadata = {
  title: 'A Carpintaria — Studio | Pinto & Pintos',
  description: 'Protótipo experimental da história da Carpintaria Pinto & Pintos.',
  robots: { index: false, follow: false },
};

export default AboutStudioPage;
