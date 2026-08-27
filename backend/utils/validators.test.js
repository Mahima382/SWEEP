/**
 * Unit tests for shared auth validators (FR-01, FR-02).
 * Pure functions — no Express, no database.
 */
const {
  isValidEmail, isValidPassword, isValidMobile, isValidRole, ACCOUNT_TYPES,
} = require('./validators');

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('farhan@example.com')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  farhan@example.com  ')).toBe(true);
  });

  it.each([
    ['missing @', 'farhanexample.com'],
    ['missing domain', 'farhan@'],
    ['empty string', ''],
  ])('rejects %s', (_label, value) => {
    expect(isValidEmail(value)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password meeting all policy requirements', () => {
    expect(isValidPassword('Str0ng!Pass')).toBe(true);
  });

  it.each([
    ['too short', 'Sh0rt!'],
    ['missing uppercase', 'str0ng!pass'],
    ['missing lowercase', 'STR0NG!PASS'],
    ['missing a number', 'Strong!Pass'],
    ['missing a special character', 'Str0ngPass'],
  ])('rejects a password %s', (_label, value) => {
    expect(isValidPassword(value)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe('isValidMobile', () => {
  it('accepts an 11-digit number starting with 01', () => {
    expect(isValidMobile('01712345678')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidMobile('  01712345678  ')).toBe(true);
  });

  it.each([
    ['too short', '0171234567'],
    ['too long', '017123456789'],
    ['wrong prefix', '11712345678'],
    ['non-numeric', '017abcde678'],
  ])('rejects a mobile number that is %s', (_label, value) => {
    expect(isValidMobile(value)).toBe(false);
  });
});

describe('isValidRole', () => {
  it.each(ACCOUNT_TYPES)('accepts the self-registrable role "%s"', (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it('rejects the admin role (platform-managed, not self-registrable)', () => {
    expect(isValidRole('admin')).toBe(false);
  });

  it('rejects an unknown role', () => {
    expect(isValidRole('superuser')).toBe(false);
  });
});
