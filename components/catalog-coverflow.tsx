'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  localized,
  translatedCatalogCategory,
  useLocale,
} from '@/components/locale';
import { useCmsCategories, useCmsItems } from '@/components/use-cms';
import { catalogCategories as defaultCatalogCategories } from '@/lib/categories';
import { catalogItems } from '@/lib/content';
import type { CmsCategory, CmsItem } from '@/lib/cms-types';
import { createPintoCarousel } from '@/pinto-pintos-carrossel/carrossel.mjs';
import referenceImage from '@/pinto-pintos-carrossel/assets/reference.png';
import '@/pinto-pintos-carrossel/carrossel.css';
import styles from './catalog-coverflow.module.css';

const catalogFallback: CmsItem[] = catalogItems.map((item, index) => ({
  id: item.id,
  kind: 'catalog',
  slug: item.id,
  category: item.id,
  title: { pt: item.title, en: '', fr: '' },
  description: { pt: '', en: '', fr: '' },
  materials: { pt: '', en: '', fr: '' },
  coverImage: item.image,
  images: [item.image],
  client: '',
  location: '',
  year: '',
  sortOrder: index,
  published: true,
}));

const categoryFallback: CmsCategory[] = defaultCatalogCategories.map(
  (category, index) => ({
    id: category.value,
    kind: 'catalog',
    slug: category.value,
    name: { pt: category.label, en: '', fr: '' },
    sortOrder: index,
  }),
);

export function CatalogCoverflow() {
  const { locale, t } = useLocale();
  const items = useCmsItems('catalog', catalogFallback);
  const categories = useCmsCategories('catalog', categoryFallback);
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const visibleCategories = useMemo(() => {
    const used = new Set(items.map((item) => item.category || item.slug));
    return categories.filter((category) => used.has(category.slug));
  }, [categories, items]);

  const resolvedFilter =
    activeFilter === 'all' ||
    visibleCategories.some((category) => category.slug === activeFilter)
      ? activeFilter
      : 'all';

  const filteredItems = useMemo(
    () =>
      resolvedFilter === 'all'
        ? items
        : items.filter(
            (item) => (item.category || item.slug) === resolvedFilter,
          ),
    [items, resolvedFilter],
  );

  const carouselItems = useMemo(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        name:
          localized(item.title, locale) ||
          translatedCatalogCategory(item.category || item.slug, locale),
        imageUrl: item.coverImage,
      })),
    [filteredItems, locale],
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !carouselItems.length) return;

    const controller = createPintoCarousel(mount, {
      imageUrl: referenceImage.src,
      items: carouselItems,
    });
    return () => controller.destroy();
  }, [carouselItems]);

  const allLabel =
    locale === 'pt' ? 'Todas' : locale === 'fr' ? 'Toutes' : 'All';
  const filterOptions = [
    { slug: 'all', label: allLabel },
    ...visibleCategories.map((category) => ({
      slug: category.slug,
      label:
        category.name[locale] ||
        translatedCatalogCategory(category.slug, locale),
    })),
  ];

  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-label={t.catalog}>
        <div className={styles.ambientLight} aria-hidden="true" />

        <div className={styles.catalogIntro}>
          <h1>
            {t.hero1}
            <span>{t.hero2}</span>
          </h1>
          <span className={styles.introRule} aria-hidden="true" />
          <p>{t.heroIntro}</p>
        </div>

        <div className={styles.carouselViewport}>
          {carouselItems.length ? (
            <div ref={mountRef} className={styles.carouselMount} />
          ) : (
            <p className={styles.empty}>Não existem imagens nesta categoria.</p>
          )}
        </div>

        <div className={styles.filterBlock}>
          <nav className={styles.filters} aria-label={t.filter}>
            {filterOptions.map((filter, index) => (
              <button
                type="button"
                key={filter.slug}
                className={
                  filter.slug === resolvedFilter ? styles.filterActive : ''
                }
                aria-current={
                  filter.slug === resolvedFilter ? 'true' : undefined
                }
                onClick={() => setActiveFilter(filter.slug)}
              >
                <small>{String(index + 1).padStart(2, '0')}</small>
                <span>{filter.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
