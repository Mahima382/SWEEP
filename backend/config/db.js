/**
 * SQLite connection (Model-layer database access).
 *
 * Uses Node's built-in node:sqlite module (DatabaseSync) — no external
 * driver dependency, no native build step. The schema is (re)applied on
 * every boot via "CREATE TABLE IF NOT EXISTS", so first run and later
 * runs both work unattended.
 *
 * DB_PATH (optional): file path for the database file. Defaults to
 * backend/database/sweep.db, or an in-memory database when NODE_ENV=test
 * (Vitest sets this), so test runs never touch the on-disk database.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DEFAULT_DB_PATH = path.join(__dirname, '../database/sweep.db');
const DB_PATH = process.env.DB_PATH
  || (process.env.NODE_ENV === 'test' ? ':memory:' : DEFAULT_DB_PATH);

const db = new DatabaseSync(DB_PATH);

const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
db.exec(schema);

/**
 * Adds columns introduced after a database file was first created.
 * "CREATE TABLE IF NOT EXISTS" above only creates the table on first boot,
 * so an on-disk sweep.db from before a schema change needs its new columns
 * added explicitly (FR-02 login lockout columns, added post-FR-01).
 */
const existingColumns = new Set(db.prepare('PRAGMA table_info(users)').all().map((col) => col.name));
if (!existingColumns.has('failed_attempts')) {
  db.exec('ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0');
}
if (!existingColumns.has('locked_until')) {
  db.exec('ALTER TABLE users ADD COLUMN locked_until TEXT');
}
if (!existingColumns.has('profile_completed')) {
  db.exec('ALTER TABLE users ADD COLUMN profile_completed INTEGER NOT NULL DEFAULT 0');
}
if (!existingColumns.has('profile_data')) {
  db.exec('ALTER TABLE users ADD COLUMN profile_data TEXT');
}
if (!existingColumns.has('reset_token')) {
  db.exec('ALTER TABLE users ADD COLUMN reset_token TEXT');
}
if (!existingColumns.has('reset_token_expires')) {
  db.exec('ALTER TABLE users ADD COLUMN reset_token_expires TEXT');
}

module.exports = db;
