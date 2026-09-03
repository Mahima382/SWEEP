/**
 * Unit tests for the user service — verifies it delegates to the shared
 * API client with the right path/payload, with the network layer mocked out.
 */
import { getMyProfile, completeProfile } from './userService';
import { get, patch } from './api';

vi.mock('./api', () => ({
  get: vi.fn(),
  patch: vi.fn(),
}));

describe('userService.getMyProfile', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('gets /users/me', () => {
    get.mockResolvedValue({ user: { id: 1 } });

    getMyProfile();

    expect(get).toHaveBeenCalledWith('/users/me');
  });

  it('propagates a rejection from the API client', async () => {
    get.mockRejectedValue(new Error('Authentication required'));

    await expect(getMyProfile()).rejects.toThrow('Authentication required');
  });
});

describe('userService.completeProfile', () => {
  beforeEach(() => {
    patch.mockReset();
  });

  it('patches /users/me/profile with the profile payload', () => {
    const payload = { nid: '1234567890', address: { division: 'Dhaka' } };
    patch.mockResolvedValue({ user: { id: 1, profileCompleted: true } });

    completeProfile(payload);

    expect(patch).toHaveBeenCalledWith('/users/me/profile', payload);
  });

  it('resolves with whatever the API client returns', async () => {
    const response = { user: { id: 1, profileCompleted: true } };
    patch.mockResolvedValue(response);

    await expect(completeProfile({})).resolves.toBe(response);
  });

  it('propagates a rejection from the API client', async () => {
    patch.mockRejectedValue(new Error('Please correct the highlighted fields.'));

    await expect(completeProfile({})).rejects.toThrow('Please correct the highlighted fields.');
  });
});
