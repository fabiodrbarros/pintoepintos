import 'server-only';

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { catalogItems, projects } from '@/lib/content';
import type { CmsCategory, CmsItem, ContentKind } from '@/lib/cms-types';
import { categoriesFor } from '@/lib/categories';
import { migrateCatalog2026 } from '@/db/migrations/catalog-2026.mjs';

const databasePath = process.env.DATABASE_PATH || './data/site.db';
function openDatabase(path: string): Database.Database {
  return new Database(path);
}

type GlobalDatabase = typeof globalThis & {
  __pintosDb?: Database.Database;
};

function initialize(db: Database.Database) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('catalog', 'project')),
      slug TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      title_pt TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      title_fr TEXT NOT NULL DEFAULT '',
      description_pt TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      description_fr TEXT NOT NULL DEFAULT '',
      materials_pt TEXT NOT NULL DEFAULT '',
      materials_en TEXT NOT NULL DEFAULT '',
      materials_fr TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      images_json TEXT NOT NULL DEFAULT '[]',
      client TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      year TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(kind, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_content_kind_published_order
      ON content_items(kind, published, sort_order);
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('catalog', 'project')),
      slug TEXT NOT NULL,
      name_pt TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      name_fr TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE(kind, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_categories_kind_order ON categories(kind, sort_order);
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const categoryTotal = db.prepare('SELECT COUNT(*) AS total FROM categories').get() as { total: number };
  if (categoryTotal.total === 0) seedCategories(db);
  const total = db.prepare('SELECT COUNT(*) AS total FROM content_items').get() as {
    total: number;
  };
  if (total.total === 0) seed(db);
  db.exec(`
    UPDATE content_items SET category = 'moradia' WHERE kind = 'project' AND lower(category) = 'moradia';
    UPDATE content_items SET category = 'espaco-comercial' WHERE kind = 'project' AND lower(category) IN ('espaço comercial', 'espaco comercial');
  `);
  migrateCatalog2026(db);
}

function seedCategories(db: Database.Database) {
  const insert = db.prepare('INSERT INTO categories (id, kind, slug, name_pt, sort_order) VALUES (?, ?, ?, ?, ?)');
  const transaction = db.transaction(() => {
    (['project', 'catalog'] as ContentKind[]).forEach((kind) => {
      categoriesFor(kind).forEach((category, index) => {
        const slug = kind === 'project' ? (category.value === 'Moradia' ? 'moradia' : 'espaco-comercial') : category.value;
        insert.run(randomUUID(), kind, slug, category.label, index);
      });
    });
  });
  transaction();
}

function seed(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO content_items (
      id, kind, slug, category, title_pt, description_pt, materials_pt,
      cover_image, images_json, client, location, year, sort_order, published
    ) VALUES (
      @id, @kind, @slug, @category, @titlePt, @descriptionPt, @materialsPt,
      @coverImage, @imagesJson, @client, @location, @year, @sortOrder, 1
    )
  `);

  const transaction = db.transaction(() => {
    catalogItems.forEach((item) =>
      insert.run({
        id: item.id,
        kind: 'catalog',
        slug: item.slug,
        category: item.category,
        titlePt: item.title,
        descriptionPt: item.description,
        materialsPt: item.materials,
        coverImage: item.image,
        imagesJson: JSON.stringify([item.image]),
        client: '',
        location: '',
        year: item.year,
        sortOrder: item.sortOrder,
      }),
    );
    projects.forEach((project, index) =>
      insert.run({
        id: randomUUID(),
        kind: 'project',
        slug: project.slug,
        category: project.category,
        titlePt: project.title,
        descriptionPt: project.services,
        materialsPt: project.materials,
        coverImage: project.image,
        imagesJson: JSON.stringify(project.images),
        client: project.client,
        location: project.location,
        year: project.date,
        sortOrder: index,
      }),
    );
  });
  transaction();
}

export function getDb() {
  const scope = globalThis as GlobalDatabase;
  if (!scope.__pintosDb) {
    mkdirSync(dirname(databasePath), { recursive: true });
    scope.__pintosDb = openDatabase(databasePath);
    initialize(scope.__pintosDb);
  }
  return scope.__pintosDb;
}

type ContentRow = {
  id: string;
  kind: ContentKind;
  slug: string;
  category: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  description_pt: string;
  description_en: string;
  description_fr: string;
  materials_pt: string;
  materials_en: string;
  materials_fr: string;
  cover_image: string;
  images_json: string;
  client: string;
  location: string;
  year: string;
  sort_order: number;
  published: number;
  created_at: string;
  updated_at: string;
};

function rowToItem(row: ContentRow): CmsItem {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    category: row.category,
    title: { pt: row.title_pt, en: row.title_en, fr: row.title_fr },
    description: {
      pt: row.description_pt,
      en: row.description_en,
      fr: row.description_fr,
    },
    materials: {
      pt: row.materials_pt,
      en: row.materials_en,
      fr: row.materials_fr,
    },
    coverImage: row.cover_image,
    images: JSON.parse(row.images_json || '[]'),
    client: row.client,
    location: row.location,
    year: row.year,
    sortOrder: row.sort_order,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listItems(kind?: ContentKind, includeDrafts = false) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (kind) {
    clauses.push('kind = ?');
    params.push(kind);
  }
  if (!includeDrafts) clauses.push('published = 1');
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return (
    getDb()
      .prepare(
        `SELECT * FROM content_items ${where} ORDER BY sort_order ASC, created_at ASC`,
      )
      .all(...params) as ContentRow[]
  ).map(rowToItem);
}

export function getItem(kind: ContentKind, slug: string) {
  const row = getDb()
    .prepare('SELECT * FROM content_items WHERE kind = ? AND slug = ? AND published = 1')
    .get(kind, slug) as ContentRow | undefined;
  return row ? rowToItem(row) : null;
}

export function saveItem(item: CmsItem) {
  const now = new Date().toISOString();
  getDb()
    .prepare(`
      INSERT INTO content_items (
        id, kind, slug, category, title_pt, title_en, title_fr,
        description_pt, description_en, description_fr,
        materials_pt, materials_en, materials_fr,
        cover_image, images_json, client, location, year, sort_order,
        published, created_at, updated_at
      ) VALUES (
        @id, @kind, @slug, @category, @titlePt, @titleEn, @titleFr,
        @descriptionPt, @descriptionEn, @descriptionFr,
        @materialsPt, @materialsEn, @materialsFr,
        @coverImage, @imagesJson, @client, @location, @year, @sortOrder,
        @published, @createdAt, @updatedAt
      ) ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind, slug = excluded.slug, category = excluded.category,
        title_pt = excluded.title_pt, title_en = excluded.title_en,
        title_fr = excluded.title_fr,
        description_pt = excluded.description_pt,
        description_en = excluded.description_en,
        description_fr = excluded.description_fr,
        materials_pt = excluded.materials_pt,
        materials_en = excluded.materials_en,
        materials_fr = excluded.materials_fr,
        cover_image = excluded.cover_image, images_json = excluded.images_json,
        client = excluded.client, location = excluded.location, year = excluded.year,
        sort_order = excluded.sort_order, published = excluded.published,
        updated_at = excluded.updated_at
    `)
    .run({
      id: item.id || randomUUID(),
      kind: item.kind,
      slug: item.slug,
      category: item.category,
      titlePt: item.title.pt,
      titleEn: item.title.en,
      titleFr: item.title.fr,
      descriptionPt: item.description.pt,
      descriptionEn: item.description.en,
      descriptionFr: item.description.fr,
      materialsPt: item.materials.pt,
      materialsEn: item.materials.en,
      materialsFr: item.materials.fr,
      coverImage: item.coverImage,
      imagesJson: JSON.stringify(item.images),
      client: item.client,
      location: item.location,
      year: item.year,
      sortOrder: item.sortOrder,
      published: item.published ? 1 : 0,
      createdAt: item.createdAt || now,
      updatedAt: now,
    });
}

export function deleteItem(id: string) {
  return getDb().prepare('DELETE FROM content_items WHERE id = ?').run(id);
}

type CategoryRow = { id: string; kind: ContentKind; slug: string; name_pt: string; name_en: string; name_fr: string; sort_order: number };

function rowToCategory(row: CategoryRow): CmsCategory {
  return { id: row.id, kind: row.kind, slug: row.slug, name: { pt: row.name_pt, en: row.name_en, fr: row.name_fr }, sortOrder: row.sort_order };
}

export function listCategories(kind?: ContentKind) {
  const rows = kind
    ? getDb().prepare('SELECT * FROM categories WHERE kind = ? ORDER BY sort_order, name_pt').all(kind)
    : getDb().prepare('SELECT * FROM categories ORDER BY kind, sort_order, name_pt').all();
  return (rows as CategoryRow[]).map(rowToCategory);
}

export function categoryExists(kind: ContentKind, slug: string) {
  return Boolean(getDb().prepare('SELECT 1 FROM categories WHERE kind = ? AND slug = ?').get(kind, slug));
}

export function saveCategory(category: CmsCategory) {
  getDb().prepare(`
    INSERT INTO categories (id, kind, slug, name_pt, name_en, name_fr, sort_order)
    VALUES (@id, @kind, @slug, @pt, @en, @fr, @sortOrder)
    ON CONFLICT(id) DO UPDATE SET kind=excluded.kind, slug=excluded.slug,
      name_pt=excluded.name_pt, name_en=excluded.name_en, name_fr=excluded.name_fr,
      sort_order=excluded.sort_order
  `).run({ id: category.id, kind: category.kind, slug: category.slug, pt: category.name.pt, en: category.name.en, fr: category.name.fr, sortOrder: category.sortOrder });
}

export function deleteCategory(id: string) {
  const category = getDb().prepare('SELECT kind, slug FROM categories WHERE id = ?').get(id) as { kind: ContentKind; slug: string } | undefined;
  if (!category) return;
  const usage = getDb().prepare('SELECT COUNT(*) AS total FROM content_items WHERE kind = ? AND category = ?').get(category.kind, category.slug) as { total: number };
  if (usage.total > 0) throw new Error('Esta categoria está a ser usada por conteúdos.');
  getDb().prepare('DELETE FROM categories WHERE id = ?').run(id);
}
