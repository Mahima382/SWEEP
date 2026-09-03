/**
 * HTTP tests for FR-04 review routes (supertest, no listening server).
 */
const request = require('supertest');
const app = require('../app');
const { resetStore } = require('../models/walletModel');

describe('GET /api/reviews', () => {
  beforeEach(() => {
    resetStore();
  });

  it('lists reviews already on the demo ledger', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ transactionId: 'TXN-7566', rating: 5 }),
        expect.objectContaining({ transactionId: 'TXN-7580', rating: 4 }),
      ]),
    );
  });

  it('filters reviews by transactionId', async () => {
    const res = await request(app)
      .get('/api/reviews')
      .query({ transactionId: 'TXN-7566' });
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].comment).toBe('Friendly collector.');
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    resetStore();
  });

  it('saves a rating on a confirmed pickup earning', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        transactionId: 'TXN-7721',
        rating: 5,
        comment: 'Quick pickup',
      });
    expect(res.status).toBe(200);
    const reviewed = res.body.transactions.find((row) => row.id === 'TXN-7721');
    expect(reviewed.review).toMatchObject({
      rating: 5,
      comment: 'Quick pickup',
    });
  });

  it('rejects a missing transactionId', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ rating: 5 });
    expect(res.status).toBe(400);
    expect(res.body.errors.transactionId).toBeDefined();
  });

  it('rejects an unknown transaction', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ transactionId: 'TXN-missing', rating: 5 });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/);
  });

  it('rejects a review on a pending earning', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ transactionId: 'TXN-7542', rating: 5 });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/cannot be reviewed/);
  });

  it('rejects a second review on the same earning', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ transactionId: 'TXN-7566', rating: 3 });
    expect(res.status).toBe(409);
  });

  it('rejects a review on a withdrawal', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ transactionId: 'WD-7700', rating: 5 });
    expect(res.status).toBe(409);
  });

  it('rejects a rating outside 1–5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ transactionId: 'TXN-7721', rating: 8 });
    expect(res.status).toBe(400);
    expect(res.body.errors.rating).toMatch(/1 to 5/);
  });
});
