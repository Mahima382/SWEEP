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

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validPayload);
  });

  it('logs in with the correct email and password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: validPayload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      role: 'household', email: validPayload.email, status: 'active',
    });
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('is case-insensitive on email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'FARHAN@example.com', password: validPayload.password,
    });

    expect(res.status).toBe(200);
  });

  it('rejects an unknown email with a generic 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com', password: validPayload.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('rejects the wrong password with a generic 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: 'WrongPass1!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('rejects a missing password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email,
    });

    expect(res.status).toBe(400);
  });

  it('rejects a non-string password with 400 instead of erroring', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: 12345678,
    });

    expect(res.status).toBe(400);
  });

  it('still blocks a locked account even with the correct password', async () => {
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/auth/login').send({
        email: validPayload.email, password: 'WrongPass1!',
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: validPayload.password,
    });

    expect(res.status).toBe(423);
  });

  it('locks the account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/auth/login').send({
        email: validPayload.email, password: 'WrongPass1!',
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: validPayload.password,
    });

    expect(res.status).toBe(423);
  });

  it('blocks a suspended account with 403', async () => {
    db.prepare("UPDATE users SET status = 'suspended' WHERE email = ?").run(validPayload.email);

    const res = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: validPayload.password,
    });

    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/forgot-password', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validPayload);
  });

  it('returns a reset token for a registered email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: validPayload.email,
    });

    expect(res.status).toBe(200);
    expect(res.body.resetToken).toEqual(expect.any(String));
    expect(res.body.resetTokenExpiresAt).toEqual(expect.any(String));
  });

  it('is case-insensitive on email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'FARHAN@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.resetToken).toEqual(expect.any(String));
  });

  it('responds with the same generic message and no token for an unknown email, to avoid leaking registered emails', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'nobody@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
    expect(res.body.resetToken).toBeUndefined();
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'not-an-email',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  let resetToken;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: validPayload.email,
    });
    resetToken = res.body.resetToken;
  });

  it('resets the password and allows logging in with the new password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'NewStr0ng!Pass',
    });

    expect(res.status).toBe(200);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: 'NewStr0ng!Pass',
    });
    expect(loginRes.status).toBe(200);
  });

  it('rejects the old password after a reset', async () => {
    await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'NewStr0ng!Pass',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: validPayload.password,
    });
    expect(loginRes.status).toBe(401);
  });

  it('rejects an unknown or already-used token', async () => {
    await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'NewStr0ng!Pass',
    });

    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'AnotherStr0ng!Pass',
    });

    expect(res.status).toBe(400);
  });

  it('rejects an expired token', async () => {
    db.prepare("UPDATE users SET reset_token_expires = '2000-01-01T00:00:00.000Z' WHERE email = ?")
      .run(validPayload.email);

    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'NewStr0ng!Pass',
    });

    expect(res.status).toBe(400);
  });

  it('rejects a weak new password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'weak',
    });

    expect(res.status).toBe(400);
  });

  it('clears a login lockout as part of a successful reset', async () => {
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/auth/login').send({
        email: validPayload.email, password: 'WrongPass1!',
      });
    }

    await request(app).post('/api/auth/reset-password').send({
      token: resetToken, password: 'NewStr0ng!Pass',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: validPayload.email, password: 'NewStr0ng!Pass',
    });
    expect(loginRes.status).toBe(200);
  });
});
