/**
 * HTTP tests for FR-04 wallet routes (supertest, no listening server).
 */
const request = require('supertest');
const app = require('../app');
const { resetStore } = require('../models/walletModel');

describe('GET /api/wallet', () => {
  beforeEach(() => {
    resetStore();
  });

  it('returns the household ledger and mockup totals', async () => {
    const res = await request(app).get('/api/wallet');
    expect(res.status).toBe(200);
    expect(res.body.availableBdt).toBe(2850);
    expect(res.body.pendingBdt).toBe(620);
    expect(res.body.earnedBdt).toBe(8750);
    expect(res.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'TXN-7721', type: 'earning' }),
        expect.objectContaining({ id: 'WD-7700', type: 'withdrawal' }),
      ]),
    );
  });
});

describe('POST /api/wallet/withdraw', () => {
  beforeEach(() => {
    resetStore();
  });

  it('records a bKash payout and lowers available balance', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 500,
        method: 'bkash',
        account: '01712345678',
      });
    expect(res.status).toBe(200);
    expect(res.body.transactions[0]).toMatchObject({
      id: 'WD-7701',
      type: 'withdrawal',
      status: 'completed',
      amountBdt: 500,
      reference: 'bKash ***678',
    });
    expect(res.body.availableBdt).toBe(2350);

    const again = await request(app).get('/api/wallet');
    expect(again.body.transactions[0].id).toBe('WD-7701');
    expect(again.body.availableBdt).toBe(2350);
  });

  it('accepts a bank account payout', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 100,
        method: 'bank',
        account: '123456789012',
      });
    expect(res.status).toBe(200);
    expect(res.body.transactions[0].reference).toBe('Bank ***012');
  });

  it('rejects an amount above the available balance', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 99999,
        method: 'bkash',
        account: '01712345678',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/up to/);
    expect(res.body.errors.amountBdt).toMatch(/up to/);
  });

  it('rejects a short mobile number', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 50,
        method: 'nagad',
        account: '123',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.account).toMatch(/11-digit/);
  });

  it('rejects a missing payout method', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 50,
        account: '01712345678',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.method).toMatch(/bKash/);
  });

  it('rejects a fractional Taka amount', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .send({
        amountBdt: 10.5,
        method: 'bkash',
        account: '01712345678',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors.amountBdt).toMatch(/whole Taka/);
  });
});

describe('GET /api/wallet/export', () => {
  beforeEach(() => {
    resetStore();
  });

  it('downloads a CSV of the ledger', async () => {
    const res = await request(app).get('/api/wallet/export/csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/sweep-wallet\.csv/);
    expect(res.text).toContain('TXN-7721');
    expect(res.text).toContain('Available,2850');
  });

  it('downloads a PDF of the ledger', async () => {
    const res = await request(app).get('/api/wallet/export/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/sweep-wallet\.pdf/);
    expect(res.body.toString('ascii').slice(0, 8)).toBe('%PDF-1.4');
  });
});
