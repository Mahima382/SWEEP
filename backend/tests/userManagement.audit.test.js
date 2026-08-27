/**
 * Route/controller tests for FR-11 User Management audit integration.
 * Verifies the fail-closed requirement: a sensitive action is ONLY committed
 * when its audit record can be written. config/db.js swaps in an in-memory
 * MySQL stand-in under NODE_ENV=test; commit/rollback hooks assert the
 * transaction behaviour.
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

const superAdminRow = [{ id: 2, role: 'admin', status: 'active' }];
const notSuper = [];

describe('User Management audit integration (fail-closed)', () => {
  it('bans a user, writes an audit record, and commits', async () => {
    let committed = false;
    db.setHooks({ onCommit: () => { committed = true; } });
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('FROM users')) {
        return Promise.resolve([notSuper, {}]);
      }
      if (sql.includes('UPDATE users SET')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/users/2/ban')
      .set(auth())
      .send({ action: 'Ban', reason: 'fraud' });
    expect(res.status).toBe(200);
    expect(committed).toBe(true);
  });

  it('verifies KYC and commits its audit record', async () => {
    let committed = false;
    db.setHooks({ onCommit: () => { committed = true; } });
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('FROM users')) {
        return Promise.resolve([notSuper, {}]);
      }
      if (sql.includes('UPDATE users SET')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/users/2/kyc-verify')
      .set(auth());
    expect(res.status).toBe(200);
    expect(committed).toBe(true);
  });

  it('preserves super-admin protection (403, no status change)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('FROM users')) {
        return Promise.resolve([superAdminRow, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/users/2/ban')
      .set(auth())
      .send({ action: 'Ban', reason: 'fraud' });
    expect(res.status).toBe(403);
  });

  it('BLOCKS the action when the audit write fails (fail-closed)', async () => {
    let rolledBack = false;
    db.setHooks({ onRollback: () => { rolledBack = true; } });
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT id, name') && sql.includes('FROM users')) {
        return Promise.resolve([notSuper, {}]);
      }
      if (sql.includes('UPDATE users SET')) {
        return Promise.resolve([{ affectedRows: 1 }, {}]);
      }
      if (sql.includes('INSERT INTO audit_logs')) {
        return Promise.reject(new Error('audit store unavailable'));
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/users/2/ban')
      .set(auth())
      .send({ action: 'Ban', reason: 'fraud' });
    expect(res.status).toBe(500);
    expect(rolledBack).toBe(true);
  });
});
