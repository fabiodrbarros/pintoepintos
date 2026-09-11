import { catalog2026 } from '../seeds/catalog-2026.mjs';

export const migrationId = '20260911_catalog_2026';

const legacyCatalogItems = [
  {
    slug: 'cozinhas',
    title: 'Cozinhas',
    image: '/catalogo/cozinhas.jpg',
    sortOrder: 0,
  },
  {
    slug: 'roupeiros',
    title: 'Roupeiros',
    image: '/catalogo/roupeiros.jpg',
    sortOrder: 1,
  },
  {
    slug: 'portas-janelas',
    title: 'Portas e Janelas',
    image: '/catalogo/portas-janelas.jpg',
    sortOrder: 2,
  },
  {
    slug: 'moveis',
    title: 'Móveis',
    image: '/catalogo/moveis.jpg',
    sortOrder: 3,
  },
  {
    slug: 'pavimentos',
    title: 'Pavimentos',
    image: '/catalogo/pavimentos.png',
    sortOrder: 4,
  },
  {
    slug: 'tetos-revestimentos',
    title: 'Tetos e Revestimentos',
    image: '/catalogo/tetos-revestimentos.jpg',
    sortOrder: 5,
  },
];

export function migrateCatalog2026(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  if (
    db.prepare('SELECT 1 FROM schema_migrations WHERE id = ?').get(migrationId)
  ) {
    return { applied: false, insertedItems: 0, hiddenLegacyItems: 0 };
  }

  const migrate = db.transaction(() => {
    const insertCategory = db.prepare(`
      INSERT INTO categories (id, kind, slug, name_pt, name_en, name_fr, sort_order)
      VALUES (@id, 'catalog', @slug, @name, '', '', @sortOrder)
      ON CONFLICT DO NOTHING
    `);
    for (const category of catalog2026.categories) insertCategory.run(category);

    const insertItem = db.prepare(`
      INSERT INTO content_items (
        id, kind, slug, category, title_pt, title_en, title_fr,
        description_pt, description_en, description_fr,
        materials_pt, materials_en, materials_fr,
        cover_image, images_json, client, location, year, sort_order, published
      ) VALUES (
        @id, 'catalog', @slug, @category, @title, '', '',
        @description, '', '', @materials, '', '',
        @image, @images, '', '', @year, @sortOrder, 1
      ) ON CONFLICT DO NOTHING
    `);
    let insertedItems = 0;
    for (const item of catalog2026.items) {
      insertedItems += Number(
        insertItem.run({ ...item, images: JSON.stringify([item.image]) })
          .changes,
      );
    }

    const hideUntouchedLegacyItem = db.prepare(`
      UPDATE content_items SET published = 0, updated_at = CURRENT_TIMESTAMP
      WHERE kind = 'catalog' AND slug = @slug AND category = @slug
        AND title_pt = @title AND title_en = '' AND title_fr = ''
        AND description_pt = '' AND description_en = '' AND description_fr = ''
        AND materials_pt = '' AND materials_en = '' AND materials_fr = ''
        AND cover_image = @image AND images_json = @images
        AND client = '' AND location = '' AND year = ''
        AND sort_order = @sortOrder AND published = 1 AND updated_at = created_at
    `);
    let hiddenLegacyItems = 0;
    for (const item of legacyCatalogItems) {
      hiddenLegacyItems += Number(
        hideUntouchedLegacyItem.run({
          ...item,
          images: JSON.stringify([item.image]),
        }).changes,
      );
    }

    db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(
      migrationId,
    );
    return { applied: true, insertedItems, hiddenLegacyItems };
  });
  return migrate();
}
