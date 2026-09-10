export type Locale = 'pt' | 'en' | 'fr';
export type ContentKind = 'catalog' | 'project';

export type LocalizedText = Record<Locale, string>;

export interface CmsItem {
  id: string;
  kind: ContentKind;
  slug: string;
  category: string;
  title: LocalizedText;
  description: LocalizedText;
  materials: LocalizedText;
  coverImage: string;
  images: string[];
  client: string;
  location: string;
  year: string;
  sortOrder: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsCategory {
  id: string;
  kind: ContentKind;
  slug: string;
  name: LocalizedText;
  sortOrder: number;
}

export const locales: Locale[] = ['pt', 'en', 'fr'];

export function emptyLocalizedText(value = ''): LocalizedText {
  return { pt: value, en: '', fr: '' };
}
