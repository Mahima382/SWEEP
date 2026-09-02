/**
 * Unit tests for FR-12 Auth & Security functionalities.
 */

import {
  describe, it, expect, beforeEach,
} from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// eslint-disable-next-line import/first
import app from '../app';

const db = globalThis.sweepDb;

beforeEach(() => {
  db.resetQueryImpl();
  db.resetHooks();
});

describe('FR-12 Authentication & Account Security', () => {
  describe('POST /api/auth/register', () => {
    it('registers a user successfully', async () => {
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE (nid = ? OR email = ?) AND status IN')) { return Promise.resolve([[], {}]); } // not blacklisted
        if (sql.includes('WHERE email = ?')) { return Promise.resolve([[], {}]); } // existing user email
        if (sql.includes('WHERE nid = ?')) { return Promise.resolve([[], {}]); } // existing NID
        if (sql.includes('INSERT INTO users')) { return Promise.resolve([{ insertId: 1 }, {}]); }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test', email: 'test@example.com', phone: '01234', nid: '123', password: 'Password1!', role: 'household',
        });

      expect(res.status).toBe(201);
    });

    it('blocks registration if NID or email is blacklisted (banned/suspended)', async () => {
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE (nid = ? OR email = ?) AND status IN')) { return Promise.resolve([[{ id: 99 }], {}]); } // blacklisted
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test', email: 'banned@example.com', phone: '01234', nid: 'banned-nid', password: 'Password1!', role: 'household',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not eligible/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('handles 5-attempt lockout', async () => {
      const hash = await bcrypt.hash('Password1!', 10);
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE email = ?')) {
          return Promise.resolve([[{
            id: 1,
            password_hash: hash,
            login_attempts: 5,
            lockout_until: new Date(Date.now() + 100000),
          }], {}]);
        }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password1!' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/locked/i);
    });

    it('auto-deactivates if KYC rejected over 30 days ago', async () => {
      const hash = await bcrypt.hash('Password1!', 10);
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      let statusUpdated = false;
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE email = ?')) {
          return Promise.resolve([[{
            id: 1, password_hash: hash, kyc_status: 'rejected', kyc_rejected_at: oldDate,
          }], {}]);
        }
        if (sql.includes('UPDATE users SET status = ?')) {
          statusUpdated = true;
          return Promise.resolve([{ affectedRows: 1 }, {}]);
        }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password1!' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/deactivated/i);
      expect(statusUpdated).toBe(true);
    });
  });

  describe('Password Reset', () => {
    it('POST /forgot-password sends a reset token', async () => {
      let tokenSaved = false;
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE email = ?')) { return Promise.resolve([[{ id: 1, email: 'test@example.com' }], {}]); }
        if (sql.includes('reset_token')) {
          tokenSaved = true;
          return Promise.resolve([{ affectedRows: 1 }, {}]);
        }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(tokenSaved).toBe(true);
    });

    it('POST /reset-password fails if new password is same as old', async () => {
      const rawToken = 'my-token';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const hash = await bcrypt.hash('OldPassword1!', 10);

      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE email = ?')) {
          return Promise.resolve([[{
            id: 1,
            password_hash: hash,
            reset_token: hashedToken,
            reset_expires: new Date(Date.now() + 100000),
          }], {}]);
        }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'test@example.com', token: rawToken, newPassword: 'OldPassword1!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/differ from the previous password/i);
    });

    it('POST /reset-password invalidates all sessions by incrementing token_version', async () => {
      const rawToken = 'my-token';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const hash = await bcrypt.hash('OldPassword1!', 10);

      let tokenVersionIncremented = false;
      db.setQueryImpl((sql) => {
        if (sql.includes('WHERE email = ?')) {
          return Promise.resolve([[{
            id: 1,
            password_hash: hash,
            reset_token: hashedToken,
            reset_expires: new Date(Date.now() + 100000),
          }], {}]);
        }
        if (sql.includes('token_version = IFNULL')) {
          tokenVersionIncremented = true;
          return Promise.resolve([{ affectedRows: 1 }, {}]);
        }
        return Promise.resolve([[], {}]);
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'test@example.com', token: rawToken, newPassword: 'NewPassword1!' });

      expect(res.status).toBe(200);
      expect(tokenVersionIncremented).toBe(true);
    });
  });
});
