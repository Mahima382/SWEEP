/**
 * Unit tests for the auth service — verifies it delegates to the shared
 * API client with the right path/payload, with the network layer mocked out.
 */
import { login, register } from './authService';
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
