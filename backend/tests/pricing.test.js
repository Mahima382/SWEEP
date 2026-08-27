/**
 * Route/controller tests for Pricing & Commission (FR-11 §1).
 * config/db.js swaps in an in-memory MySQL stand-in under NODE_ENV=test, so no
 * live database is required. Query results are programmed per-test via
 * globalThis.sweepDb.setQueryImpl.
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

describe('Pricing & Commission', () => {
  it('rejects a price version with an overlapping effective date (409)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT COUNT(*) AS cnt FROM pricing_versions')) {
        return Promise.resolve([[{ cnt: 1 }], {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/pricing/price')
      .set(auth())
      .send({
        wasteCategory: 'Plastic', region: 'DHAKA', basePriceMin: 10, basePriceMax: 20, effectiveDate: '2026-01-01',
      });
    expect(res.status).toBe(409);
  });

  it('creates a price version (201)', async () => {
    db.setQueryImpl((sql) => {
      if (sql.includes('SELECT COUNT(*) AS cnt FROM pricing_versions')) {
        return Promise.resolve([[{ cnt: 0 }], {}]);
      }
      if (sql.includes('INSERT INTO pricing_versions')) {
        return Promise.resolve([{ insertId: 1 }, {}]);
      }
      return Promise.resolve([[], {}]);
    });
    const res = await request(app)
      .post('/api/admin/pricing/price')
      .set(auth())
      .send({
        wasteCategory: 'Plastic', region: 'DHAKA', basePriceMin: 10, basePriceMax: 20, effectiveDate: '2026-01-01',
      });
    expect(res.status).toBe(201);
    expect(res.body.wasteCategory).toBe('Plastic');
  });

  it('validates wasteCategory (400)', async () => {
    const res = await request(app)
      .post('/api/admin/pricing/price')
      .set(auth())
      .send({
        wasteCategory: 'Bogus', region: 'DHAKA', basePriceMin: 10, basePriceMax: 20, effectiveDate: '2026-01-01',
      });
    expect(res.status).toBe(400);
  });

  it('validates commissionRate fraction (400)', async () => {
    const res = await request(app)
      .post('/api/admin/pricing/commission')
      .set(auth())
      .send({ transactionType: 'order', commissionRate: 5, effectiveDate: '2026-01-01' });
    expect(res.status).toBe(400);
  });

  it('lists commission versions', async () => {
    db.setQueryImpl(() => Promise.resolve([[{
      id: 2, transaction_type: 'order', commission_rate: 0.05, effective_date: '2026-01-01',
    }], {}]));
    const res = await request(app).get('/api/admin/pricing/commission').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('rejects unauthenticated requests (401)', async () => {
    const res = await request(app).get('/api/admin/pricing/commission');
    expect(res.status).toBe(401);
  });
});
