'use client';

import { useEffect, useState } from 'react';
import type { CmsCategory, CmsItem, ContentKind } from '@/lib/cms-types';

export function useCmsItems(kind: ContentKind, fallback: CmsItem[]) {
  const [items, setItems] = useState(fallback);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/content?kind=${kind}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: CmsItem[]) => setItems(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, [kind]);
  return items;
}

export function useCmsCategories(kind: ContentKind, fallback: CmsCategory[]) {
  const [categories, setCategories] = useState(fallback);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/categories?kind=${kind}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: CmsCategory[]) => setCategories(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, [kind]);
  return categories;
}
