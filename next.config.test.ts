import { expect, it } from 'vitest';
import nextConfig from './next.config';

it('allows the loopback hostname used by the local app preview', () => {
  expect(nextConfig.allowedDevOrigins ?? []).toContain('127.0.0.1');
});
