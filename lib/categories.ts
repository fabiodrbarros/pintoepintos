import type { ContentKind } from '@/lib/cms-types';

export const projectCategories = [
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Espaço comercial', label: 'Espaço comercial' },
] as const;

export const catalogCategories = [
  { value: 'cozinhas', label: 'Cozinhas' },
  { value: 'roupeiros', label: 'Roupeiros' },
  { value: 'portas-janelas', label: 'Portas e Janelas' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'pavimentos', label: 'Pavimentos' },
  { value: 'tetos-revestimentos', label: 'Tetos e Revestimentos' },
] as const;

export function categoriesFor(kind: ContentKind): readonly { value: string; label: string }[] {
  return kind === 'project' ? projectCategories : catalogCategories;
}
