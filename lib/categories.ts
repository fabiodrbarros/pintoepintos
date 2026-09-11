import type { ContentKind } from '@/lib/cms-types';
import { catalog2026 } from '@/db/seeds/catalog-2026.mjs';

export const projectCategories = [
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Espaço comercial', label: 'Espaço comercial' },
] as const;

export const catalogCategories = catalog2026.categories.map((category) => ({
  value: category.slug,
  label: category.name,
}));

export function categoriesFor(kind: ContentKind): readonly { value: string; label: string }[] {
  return kind === 'project' ? projectCategories : catalogCategories;
}
