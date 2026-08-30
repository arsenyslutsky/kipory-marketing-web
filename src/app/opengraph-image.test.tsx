import { expect, it } from 'vitest';
import { contentType, dynamic, GET, size } from './opengraph-image.png/route';

it('returns a standard large social preview PNG response', () => {
  const response = GET();

  expect(dynamic).toBe('force-static');
  expect(size).toEqual({ height: 630, width: 1200 });
  expect(contentType).toBe('image/png');
  expect(response.headers.get('content-type')).toBe('image/png');
});
