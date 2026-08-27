/**
 * MySQL connection pool (Model-layer database access).
 *
 * Uses mysql2/promise. The pool is created lazily by mysql2 semantics:
 * no TCP connection is opened until the first query, so requiring this
 * module never crashes when MySQL is absent.
 *
 * Reads configuration from process.env:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * Test mode: when NODE_ENV === 'test', the real driver is replaced by an
 * in-memory stand-in so the backend suite runs without a live MySQL server.
 * Test behaviour is programmed through globalThis.sweepDb (setQueryImpl,
 * setHooks, resetQueryImpl, resetHooks). Under normal execution this branch
 * is never taken and the real pool is used unchanged.
 */

const mysql = require('mysql2/promise');

const store = globalThis.sweepDb || (globalThis.sweepDb = {
  queryImpl: null,
  onCommit: null,
  onRollback: null,
  setQueryImpl(fn) { this.queryImpl = fn; },
  resetQueryImpl() { this.queryImpl = null; },
  setHooks(h) {
    this.onCommit = (h && h.onCommit) || null;
    this.onRollback = (h && h.onRollback) || null;
  },
  resetHooks() {
    this.onCommit = null;
    this.onRollback = null;
  },
});

/**
 * Fake query used only under NODE_ENV=test.
 *
 * @param {string} sql - SQL statement.
 * @param {Array} params - Bound parameters.
 * @returns {Promise<[*, *]>} mysql2-style [rows, fields] tuple.
 */
function fakeQuery(sql, params) {
  if (store.queryImpl) {
    return store.queryImpl(sql, params);
  }
  return [[], {}];
}

/**
 * Fake pooled connection used only under NODE_ENV=test.
 *
 * @returns {object} Fake connection sharing the global query implementation.
 */
function fakeConnection() {
  return {
    beginTransaction: () => Promise.resolve(),
    commit: () => {
      if (store.onCommit) {
        store.onCommit();
      }
      return Promise.resolve();
    },
    rollback: () => {
      if (store.onRollback) {
        store.onRollback();
      }
      return Promise.resolve();
    },
    release: () => Promise.resolve(),
    query: (sql, p) => fakeQuery(sql, p),
  };
}

if (process.env.NODE_ENV === 'test') {
  module.exports = {
    query: fakeQuery,
    getConnection: () => Promise.resolve(fakeConnection()),
  };
} else {
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
}
