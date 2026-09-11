import Database from 'better-sqlite3';
import {
  migrateCatalog2026,
  migrationId,
} from '../db/migrations/catalog-2026.mjs';

const databasePath =
  process.argv[2] || process.env.DATABASE_PATH || './data/site.db';
const db = new Database(databasePath);

try {
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('categories', 'content_items')",
    )
    .all();
  if (tables.length !== 2) {
    throw new Error(
      'A base de dados ainda não foi inicializada pela aplicação.',
    );
  }
  console.log(
    JSON.stringify({ migration: migrationId, ...migrateCatalog2026(db) }),
  );
} finally {
  db.close();
}
