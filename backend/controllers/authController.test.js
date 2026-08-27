/**
 * Registration tests (FR-01) — supertest against the exported app,
 * exercising authController.register through the real SQLite model layer
 * (in-memory database, see backend/config/db.js).
 */
const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

const validPayload = {
  accountType: 'household',
  fullName: 'Farhan Rahman',
  email: 'farhan@example.com',
  mobile: '01712345678',
  password: 'Str0ng!Pass',
};

beforeEach(() => {
  db.exec('DELETE FROM users');
});

describe('POST /api/auth/register', () => {
  it('creates a household account as active with no KYC gate', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      role: 'household',
      fullName: 'Farhan Rahman',
      email: 'farhan@example.com',
      status: 'active',
    });
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it.each(['collector', 'global', 'company'])(
    'creates a %s account pending KYC approval',
    async (accountType) => {
      const res = await request(app).post('/api/auth/register').send({
        ...validPayload, accountType, email: `${accountType}@example.com`,
      });

      expect(res.status).toBe(201);
      expect(res.body.user.status).toBe('pending_kyc');
    },
  );

  it('rejects an unknown account type', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validPayload, accountType: 'admin',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validPayload, password: 'weak',
    });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid mobile number', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validPayload, mobile: '12345',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(409);
  });

  it('treats emails as case-insensitive duplicates', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send({
      ...validPayload, email: 'FARHAN@example.com',
    });

    expect(res.status).toBe(409);
  });
});
