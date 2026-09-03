/**
 * Wiring tests for the SWEEP Express app (supertest against the
 * exported app, no listening server needed).
 */
const request = require('supertest');
const app = require('./app');
const { resetStore } = require('./models/walletModel');

describe('GET /health', () => {
  it('returns 200 with the service status JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'sweep-backend' });
  });
});

describe('placeholder routes', () => {
  it('GET /api/waste/listings returns 501 (FR-03 not implemented)', async () => {
    const res = await request(app).get('/api/waste/listings');
    expect(res.status).toBe(501);
    expect(res.body.message).toMatch(/FR-03/);
  });

  it('GET /api/wallet returns the FR-04 household ledger', async () => {
    resetStore();
    const res = await request(app).get('/api/wallet');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.availableBdt).toBe(2850);
  });

  it('unknown route returns 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
