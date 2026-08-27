/**
 * Route/controller tests for the Fraud Detection Queue (FR-11 §3).
 * config/db.js swaps in an in-memory MySQL stand-in under NODE_ENV=test.
 * Admin decisions (clear/escalate) run inside the audited transaction,
 * asserted via commit hooks.
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
  db.resetHooks();
});

describe('Fraud Detection Queue', () => {
  it('lists the queue', async () => {
    db.setQueryImpl(() => Promise.resolve([[{ id: 1, status: 'pending', rule: 'weight_variance' }], {}]));
    const res = await request(app).get('/api/admin/fraud/queue').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns 404 for an unknown flag', async () => {
    db.setQueryImpl(() => Promise.resolve([[], {}]));
    const res = await request(app).get('/api/admin/fraud/flags/999').set(auth());
    expect(res.status).toBe(404);
  });

  it('clears a flag and commits its audit record', async () => {
    let committed = false;
    db.setHooks({ onCommit: () => { committed = true; } });
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, user_id') && sql.includes('fraud_flags')) {
        return Promise.resolve([[{ id: 3, status: 'pending', rule: 'weight_variance' }], {}]);
      }
      if (sql.includes('UPDATE fraud_flags')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/fraud/flags/3/clear')
      .set(auth())
      .send({ note: 'looks fine' });
    expect(res.status).toBe(200);
    expect(committed).toBe(true);
  });

  it('rejects clearing an already-decided flag (409)', async () => {
    db.setQueryImpl(() => Promise.resolve([[{ id: 3, status: 'cleared', rule: 'weight_variance' }], {}]));
    const res = await request(app)
      .post('/api/admin/fraud/flags/3/clear')
      .set(auth());
    expect(res.status).toBe(409);
  });

  it('creates a flag via rule evaluation', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('INSERT INTO fraud_flags')) { return Promise.resolve([{ insertId: 9 }, {}]); }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/fraud/flags')
      .set(auth())
      .send({ userId: 2, rule: 'weight_variance', context: { expectedWeight: 100, actualWeight: 200 } });
    expect(res.status).toBe(201);
  });
});
