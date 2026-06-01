import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { AiMetadata, Itinerary, StoredItineraryRow } from "../types/itinerary";

const dbPath = process.env.DATABASE_PATH ?? "./data/itineraries.db";

function ensureDataDir(): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS itineraries (
      id TEXT PRIMARY KEY,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_json TEXT NOT NULL,
      generated_by_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_itineraries_created_at
      ON itineraries (created_at DESC);
  `);

  migrateSchema(database);
}

function migrateSchema(database: Database.Database): void {
  const columns = database
    .prepare("PRAGMA table_info(itineraries)")
    .all() as Array<{ name: string }>;

  const columnNames = new Set(columns.map((col) => col.name));

  if (!columnNames.has("generated_by_json")) {
    database.exec(
      "ALTER TABLE itineraries ADD COLUMN generated_by_json TEXT"
    );
  }
}

function rowToItinerary(row: StoredItineraryRow): Itinerary {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    days: JSON.parse(row.days_json),
    createdAt: row.created_at,
    generatedBy: row.generated_by_json
      ? (JSON.parse(row.generated_by_json) as AiMetadata)
      : undefined,
  };
}

export function saveItinerary(itinerary: Itinerary): Itinerary {
  const database = getDb();

  const stmt = database.prepare(`
    INSERT INTO itineraries (
      id, destination, start_date, end_date, days_json, generated_by_json, created_at
    )
    VALUES (
      @id, @destination, @startDate, @endDate, @daysJson, @generatedByJson, @createdAt
    )
  `);

  stmt.run({
    id: itinerary.id,
    destination: itinerary.destination,
    startDate: itinerary.startDate,
    endDate: itinerary.endDate,
    daysJson: JSON.stringify(itinerary.days),
    generatedByJson: itinerary.generatedBy
      ? JSON.stringify(itinerary.generatedBy)
      : null,
    createdAt: itinerary.createdAt,
  });

  console.log(
    `Saved itinerary ${itinerary.id} (${itinerary.destination}, ${itinerary.days.length} days)`
  );

  return itinerary;
}

export function getItineraryById(id: string): Itinerary | null {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT id, destination, start_date, end_date, days_json, generated_by_json, created_at
       FROM itineraries WHERE id = ?`
    )
    .get(id) as StoredItineraryRow | undefined;

  if (!row) return null;
  return rowToItinerary(row);
}

export function listItineraries(): Itinerary[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id, destination, start_date, end_date, days_json, generated_by_json, created_at
       FROM itineraries ORDER BY created_at DESC`
    )
    .all() as StoredItineraryRow[];

  return rows.map(rowToItinerary);
}

export function countItineraries(): number {
  const database = getDb();
  const row = database
    .prepare("SELECT COUNT(*) AS count FROM itineraries")
    .get() as { count: number };
  return row.count;
}

export function getDatabaseInfo(): { path: string; count: number } {
  return {
    path: dbPath,
    count: countItineraries(),
  };
}
