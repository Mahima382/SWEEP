/**
 * Database transaction helper (FR-11 shared infrastructure).
 *
 * Wraps a unit of work in a single MySQL transaction using a dedicated
 * connection borrowed from the shared pool. Used by the audit service so that
 * a sensitive Admin action and its audit record are committed atomically
 * (fail-closed: if either fails, the whole transaction is rolled back).
 */

const db = require('../config/db');

/**
 * Runs fn inside a transaction and commits on success, rolls back on error.
 *
 * @param {Function} fn - Async callback receiving the live connection.
 * @returns {Promise<*>} The value returned by fn.
 */
async function withTransaction(fn) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { withTransaction };
