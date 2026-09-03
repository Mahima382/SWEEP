/**
 * Unit tests for the auth service — verifies it delegates to the shared
 * API client with the right path/payload, with the network layer mocked out.
 */
import {
  login, register, forgotPassword, resetPassword,
} from './authService';
import { post } from './api';

vi.mock('./api', () => ({
  post: vi.fn(),
}));

describe('authService.login', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts to /auth/login with the email and password', () => {
    post.mockResolvedValue({ token: 't', user: { id: 1 } });

    login('farhan@example.com', 'Str0ng!Pass');

    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'farhan@example.com',
      password: 'Str0ng!Pass',
    });
  });

  it('resolves with whatever the API client returns', async () => {
    const response = { token: 't', user: { id: 1, role: 'household' } };
    post.mockResolvedValue(response);

    await expect(login('farhan@example.com', 'Str0ng!Pass')).resolves.toBe(response);
  });

  it('propagates a rejection from the API client', async () => {
    post.mockRejectedValue(new Error('Invalid credentials.'));

    await expect(login('farhan@example.com', 'wrong')).rejects.toThrow('Invalid credentials.');
  });
});

describe('authService.register', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts to /auth/register with the full registration payload', () => {
    const payload = {
      accountType: 'household', fullName: 'Farhan Rahman', email: 'farhan@example.com', mobile: '01712345678', password: 'Str0ng!Pass',
    };
    post.mockResolvedValue({ user: { id: 1 } });

    register(payload);

    expect(post).toHaveBeenCalledWith('/auth/register', payload);
  });

  it('propagates a rejection from the API client', async () => {
    post.mockRejectedValue(new Error('An account with this email already exists.'));

    await expect(register({})).rejects.toThrow('An account with this email already exists.');
  });
});

describe('authService.forgotPassword', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts to /auth/forgot-password with the email', () => {
    post.mockResolvedValue({ message: 'ok' });

    forgotPassword('farhan@example.com');

    expect(post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'farhan@example.com' });
  });

  it('resolves with whatever the API client returns', async () => {
    const response = { message: 'ok', resetToken: 'abc123' };
    post.mockResolvedValue(response);

    await expect(forgotPassword('farhan@example.com')).resolves.toBe(response);
  });
});

describe('authService.resetPassword', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts to /auth/reset-password with the token and new password', () => {
    post.mockResolvedValue({ message: 'ok' });

    resetPassword('abc123', 'NewStr0ng!Pass');

    expect(post).toHaveBeenCalledWith('/auth/reset-password', { token: 'abc123', password: 'NewStr0ng!Pass' });
  });

  it('propagates a rejection from the API client', async () => {
    post.mockRejectedValue(new Error('This reset link is invalid or has expired.'));

    await expect(resetPassword('bad-token', 'NewStr0ng!Pass')).rejects.toThrow('This reset link is invalid or has expired.');
  });
});
