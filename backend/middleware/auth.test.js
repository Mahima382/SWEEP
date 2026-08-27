/**
 * Unit tests for the JWT authenticate/authorize middleware (FR-02, FR-12).
 * Express req/res/next are stubbed directly — no HTTP server involved.
 */
const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('./auth');

const SECRET = 'dev-secret';

/**
 * Builds a minimal stub Express response with jest/vitest-mocked status/json.
 * @returns {object} Stub response object.
 */
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('authenticate', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    delete process.env.JWT_SECRET;
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('attaches the decoded payload to req.user and calls next on a valid token', () => {
    const token = jwt.sign({ id: 1, role: 'household' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 1, role: 'household' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a missing Authorization header with 401', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer scheme with 401', () => {
    const token = jwt.sign({ id: 1, role: 'household' }, SECRET);
    const req = { headers: { authorization: `Basic ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid/expired token with 401', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authorize', () => {
  it('calls next when req.user has an allowed role', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = vi.fn();

    authorize(['admin', 'household'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a disallowed role with 403', () => {
    const req = { user: { role: 'household' } };
    const res = mockRes();
    const next = vi.fn();

    authorize(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: insufficient role' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when req.user is missing (authenticate did not run)', () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    authorize(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
