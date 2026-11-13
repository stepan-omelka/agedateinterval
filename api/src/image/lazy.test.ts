import { describe, expect, it, vi } from 'vitest';
import { lazy } from './lazy.js';

describe('lazy', () => {
  it('loads on first use, not before', async () => {
    const load = vi.fn(() => Promise.resolve('fonts'));

    const get = lazy(load);

    expect(load).not.toHaveBeenCalled();
    expect(await get()).toBe('fonts');
  });

  it('loads once, however many callers ask', async () => {
    const load = vi.fn(() => Promise.resolve('fonts'));
    const get = lazy(load);

    await Promise.all([get(), get()]);
    await get();

    expect(load).toHaveBeenCalledOnce();
  });

  it('tries again after a failed load', async () => {
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('disk not ready'))
      .mockResolvedValue('fonts');
    const get = lazy(load);

    await expect(get()).rejects.toThrow('disk not ready');

    expect(await get()).toBe('fonts');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
