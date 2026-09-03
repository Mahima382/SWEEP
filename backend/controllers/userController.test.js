/**
 * Profile tests (FR-01 profile completion, FR-12) — supertest against the
 * exported app, exercising userController through the real SQLite model
 * layer (in-memory database, see backend/config/db.js).
 */
const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

const householdPayload = {
  accountType: 'household',
  fullName: 'Farhan Rahman',
  email: 'farhan@example.com',
  mobile: '01712345678',
  password: 'Str0ng!Pass',
};

const companyPayload = {
  accountType: 'company',
  fullName: 'GreenTech Recyclers Ltd.',
  email: 'greentech@example.com',
  mobile: '01712345679',
  password: 'Str0ng!Pass',
};

const validAddress = {
  division: 'Dhaka',
  district: 'Dhaka',
  city: 'Dhaka City Corporation',
  area: 'Mirpur-10',
  detailedAddress: 'House 12, Road 3',
};

/**
 * Registers and logs in the given payload, returning the issued JWT.
 * @param {object} payload - Registration payload (see authController.register).
 * @returns {Promise<string>} The bearer token.
 */
async function registerAndLogin(payload) {
  await request(app).post('/api/auth/register').send(payload);
  const res = await request(app).post('/api/auth/login').send({
    email: payload.email, password: payload.password,
  });
  return res.body.token;
}

beforeEach(() => {
  db.exec('DELETE FROM users');
});

describe('GET /api/users/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the authenticated user with profileCompleted false before completion', async () => {
    const token = await registerAndLogin(householdPayload);

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: householdPayload.email, profileCompleted: false });
  });
});

describe('PATCH /api/users/me/profile', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).patch('/api/users/me/profile').send({});
    expect(res.status).toBe(401);
  });

  it('rejects an incomplete household profile with field errors', async () => {
    const token = await registerAndLogin(householdPayload);

    const res = await request(app)
      .patch('/api/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors.nid).toBeDefined();
    expect(res.body.errors['address.division']).toBeDefined();
  });

  it('saves a complete household profile and marks it completed', async () => {
    const token = await registerAndLogin(householdPayload);

    const res = await request(app)
      .patch('/api/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ nid: '1234567890', address: validAddress });

    expect(res.status).toBe(200);
    expect(res.body.user.profileCompleted).toBe(true);
    expect(res.body.user.profileData).toMatchObject({ nid: '1234567890' });

    const meRes = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.body.user.profileCompleted).toBe(true);
  });

  it('rejects a company profile selecting E-waste without a licence', async () => {
    const token = await registerAndLogin(companyPayload);

    const res = await request(app)
      .patch('/api/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        registrationNumber: 'C-1',
        officeAddress: 'Dhaka',
        supportedCategories: ['E-waste'],
        documents: {
          tradeLicence: 'a.pdf', companyRegistration: 'b.pdf', tin: 'c.pdf', vat: 'd.pdf', directorNid: 'e.pdf',
        },
        authorizedPerson: {
          name: 'Rahim Uddin', role: 'Managing Director', phone: '01712345678', email: 'rahim@example.com', nid: '999',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.ewasteLicenceNumber).toBeDefined();
  });
});
