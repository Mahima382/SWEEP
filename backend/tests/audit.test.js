/**
 * Route/controller tests for Audit Logs (FR-11 §4).
 * config/db.js swaps in an in-memory MySQL stand-in under NODE_ENV=test.
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

const SAMPLE_ROW = [{
  id: 1,
  actor_id: 1,
  actor_role: 'admin',
  action: 'user.banned',
  target_type: 'user',
  target_id: 2,
  details: null,
  created_at: '2026-01-01',
  record_hash: 'abc',
}];

describe('Audit Logs', () => {
  it('lists audit logs with filters', async () => {
    db.setQueryImpl(() => Promise.resolve([SAMPLE_ROW, {}]));
    const res = await request(app).get('/api/admin/audit?action=user.banned').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('exports audit logs as CSV', async () => {
    db.setQueryImpl(() => Promise.resolve([SAMPLE_ROW, {}]));
    const res = await request(app).get('/api/admin/audit/export').set(auth());
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('id,actor_id');
    expect(res.text).toContain('user.banned');
  });

  it('rejects unauthenticated requests (401)', async () => {
    const res = await request(app).get('/api/admin/audit');
    expect(res.status).toBe(401);
  });
});
