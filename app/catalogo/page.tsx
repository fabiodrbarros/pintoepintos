import { CatalogCoverflow } from '@/components/catalog-coverflow';
import { pageMetadata } from '@/lib/site-metadata';

export const metadata = pageMetadata(
  'Catálogo',
  'Conheça as soluções de carpintaria desenhadas, fabricadas e instaladas à medida.',
  '/catalogo',
);

export default function CatalogPage() {
  return <CatalogCoverflow useSiteBackground />;
}
