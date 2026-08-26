import { get, post } from './api';

describe('api get/post option passthrough', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
  });

  it('merges custom headers (e.g. Authorization) into a GET request', async () => {
    await get('/subscriptions/plans', { headers: { Authorization: 'Bearer abc' } });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer abc');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('merges custom headers into a POST request without dropping the body', async () => {
    await post('/subscriptions/subscribe', { planId: 1 }, { headers: { Authorization: 'Bearer abc' } });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer abc');
    expect(options.body).toBe(JSON.stringify({ planId: 1 }));
  });
});
