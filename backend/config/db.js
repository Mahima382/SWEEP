/**
 * MySQL connection pool (Model-layer database access).
 *
 * Uses mysql2/promise. The pool is created lazily by mysql2 semantics:
 * no TCP connection is opened until the first query, so requiring this
 * module never crashes when MySQL is absent.
 *
 * Reads configuration from process.env:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sweep',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
