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

module.exports = db;
