import { AboutStudioPage } from '@/components/about-studio';
import { pageMetadata } from '@/lib/site-metadata';

export const metadata = {
  ...pageMetadata(
    'A Carpintaria — Studio',
    'Protótipo experimental da história da Carpintaria Pinto & Pintos.',
    '/sobre-studio',
  ),
  robots: { index: false, follow: false },
};

export default AboutStudioPage;
