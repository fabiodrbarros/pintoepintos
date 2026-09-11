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

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
