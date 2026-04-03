import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const DB_PATH = path.join(process.cwd(), "data", "antisocial.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Auto-create tables on first import
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    credentials_encrypted TEXT,
    credentials_iv TEXT,
    credentials_tag TEXT,
    is_connected INTEGER NOT NULL DEFAULT 0,
    last_verified_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS post_results (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    platform_id TEXT NOT NULL REFERENCES platforms(id),
    status TEXT NOT NULL CHECK(status IN ('success', 'failure', 'skipped', 'manual')),
    external_id TEXT,
    external_url TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL
  );
`);

// Seed default platforms if empty
const count = sqlite
  .prepare("SELECT COUNT(*) as count FROM platforms")
  .get() as { count: number };

if (count.count === 0) {
  const now = new Date().toISOString();
  const defaultPlatforms = [
    { id: "bluesky", name: "Bluesky" },
    { id: "twitter", name: "Twitter / X" },
    { id: "github", name: "GitHub" },
    { id: "facebook", name: "Facebook" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "threads", name: "Threads" },
    { id: "instagram", name: "Instagram" },
    { id: "youtube", name: "YouTube" },
    { id: "substack", name: "Substack" },
  ];

  const insert = sqlite.prepare(
    "INSERT INTO platforms (id, display_name, is_connected, created_at, updated_at) VALUES (?, ?, 0, ?, ?)"
  );

  for (const p of defaultPlatforms) {
    insert.run(p.id, p.name, now, now);
  }
}
