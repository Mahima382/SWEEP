/**
 * Unit tests for the user model (D1 Users) — exercised directly against the
 * in-memory SQLite connection (NODE_ENV=test, see backend/config/db.js),
 * with no Express/HTTP layer involved.
 */
const db = require('../config/db');
const userModel = require('./userModel');

const baseUser = {
  role: 'household',
  fullName: 'Farhan Rahman',
  email: 'farhan@example.com',
  mobile: '01712345678',
  passwordHash: 'hashed-password',
  status: 'active',
};

beforeEach(() => {
  db.exec('DELETE FROM users');
});

describe('userModel.create', () => {
  it('inserts a user row and returns its numeric id', async () => {
    const id = await userModel.create(baseUser);

    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('persists all fields exactly as given', async () => {
    const id = await userModel.create(baseUser);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    expect(row).toMatchObject({
      role: 'household',
      full_name: 'Farhan Rahman',
      email: 'farhan@example.com',
      mobile: '01712345678',
      password_hash: 'hashed-password',
      status: 'active',
    });
  });

  it('rejects a duplicate email at the database level', async () => {
    await userModel.create(baseUser);
    await expect(userModel.create(baseUser)).rejects.toThrow(/UNIQUE constraint failed/);
  });

  it('rejects a role outside the allowed set', async () => {
    await expect(userModel.create({ ...baseUser, role: 'superadmin' })).rejects.toThrow();
  });
});

describe('userModel.findByEmail', () => {
  it('returns null when no user matches', async () => {
    const result = await userModel.findByEmail('nobody@example.com');
    expect(result).toBeNull();
  });

  it('returns the matching row when a user exists', async () => {
    await userModel.create(baseUser);
    const result = await userModel.findByEmail('farhan@example.com');

    expect(result).toMatchObject({ email: 'farhan@example.com', full_name: 'Farhan Rahman' });
  });

  it('is case-sensitive at the model layer (normalization is the caller\'s job)', async () => {
    await userModel.create(baseUser);
    const result = await userModel.findByEmail('FARHAN@example.com');

    expect(result).toBeNull();
  });
});
