/**
 * Route/controller tests for Operational Reports (FR-11 §5).
 * config/db.js swaps in an in-memory MySQL stand-in under NODE_ENV=test.
 * Verifies graceful degradation when a required table is missing
 * (ER_NO_SUCH_TABLE) and normal aggregation when rows are returned.
 */

import {
  describe, it, expect, beforeEach,
} from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line import/first
import app from '../app';

const db = globalThis.sweepDb;
const ADMIN_TOKEN = jwt.sign({ id: 1, role: 'admin' }, 'dev-secret');
const auth = () => ({ Authorization: `Bearer ${ADMIN_TOKEN}` });

beforeEach(() => {
  db.resetQueryImpl();
});

describe('Operational Reports', () => {
  it('returns data when the tables exist', async () => {
    db.setQueryImpl(() => Promise.resolve([[{ waste_category: 'Plastic', listings: 3, total_weight: 50 }], {}]));
    const res = await request(app).get('/api/admin/reports/collection-volume').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
    expect(res.body.byCategory).toHaveLength(1);
  });

  it('degrades gracefully when a table is missing (ER_NO_SUCH_TABLE)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('transactions') || sql.includes('subscriptions')) {
        const err = new Error('no such table');
        err.code = 'ER_NO_SUCH_TABLE';
        return Promise.reject(err);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app).get('/api/admin/reports/revenue').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
    expect(res.body.note).toMatch(/not yet created/);
  });
});
