/**
 * Route/controller tests for Subscription Management (FR-11 §2).
 * config/db.js swaps in an in-memory MySQL stand-in under NODE_ENV=test.
 * Plans are never hard-deleted (archive only).
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

describe('Subscription Management', () => {
  it('creates a plan (201)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('INSERT INTO subscription_plans')) { return Promise.resolve([{ insertId: 1 }, {}]); }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/subscriptions/plans')
      .set(auth())
      .send({ name: 'Pro', price: 500, durationDays: 30 });
    expect(res.status).toBe(201);
  });

  it('returns 404 when archiving a missing plan', async () => {
    db.setQueryImpl(() => Promise.resolve([[], {}]));
    const res = await request(app)
      .post('/api/admin/subscriptions/plans/999/archive')
      .set(auth());
    expect(res.status).toBe(404);
  });

  it('archives an in-use plan without deleting it', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('subscription_plans')) {
        return Promise.resolve([[{ id: 5, name: 'Basic', archived: false }], {}]);
      }
      if (sql.includes('SELECT COUNT(*) AS cnt FROM subscriptions')) {
        return Promise.resolve([[{ cnt: 1 }], {}]);
      }
      if (sql.includes('UPDATE subscription_plans')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/subscriptions/plans/5/archive')
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body.inUse).toBe(true);
    expect(res.body.note).toMatch(/unaffected/);
  });

  it('returns 404 when updating a missing plan', async () => {
    db.setQueryImpl(() => Promise.resolve([[], {}]));
    const res = await request(app)
      .put('/api/admin/subscriptions/plans/999')
      .set(auth())
      .send({ price: 100 });
    expect(res.status).toBe(404);
  });

  it('updates a plan (200)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('subscription_plans')) {
        return Promise.resolve([[{ id: 5 }], {}]);
      }
      if (sql.includes('UPDATE subscription_plans')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .put('/api/admin/subscriptions/plans/5')
      .set(auth())
      .send({ price: 100 });
    expect(res.status).toBe(200);
  });
});
