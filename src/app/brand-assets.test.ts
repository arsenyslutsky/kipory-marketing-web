import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const brandColors = ['#2f702c', '#449c40'];
const suppliedPolygonPoints = [
  '12.12 30.24 12.12 .77 .12 10.64 0 39.7 12.12 30.24',
  '42.68 40.22 25.24 37.08 12.5 20.11 27.6 20.11 42.68 40.22',
  '42.68 0 24.77 3.77 12.5 20.11 27.6 20.11 42.68 0',
];

function readKiporySymbol() {
  return readFileSync(
    join(process.cwd(), 'public/brand/kipory-symbol-vector.svg'),
    'utf8',
  );
}

it('keeps every Kipory symbol gradient stop within the canonical brand palette', () => {
  const symbol = readKiporySymbol();
  const stopColors = [...symbol.matchAll(/stop-color="(#[0-9a-f]{6})"/gi)]
    .map((match) => match[1].toLowerCase());

  expect(stopColors.length).toBeGreaterThan(0);
  expect([...new Set(stopColors)].sort()).toEqual(brandColors);
});

it('uses the supplied Kipory polygon geometry', () => {
  const symbol = readKiporySymbol();
  const polygonPoints = [...symbol.matchAll(/<polygon[^>]+points="([^"]+)"/g)]
    .map((match) => match[1]);

  expect(symbol).toContain('viewBox="0 0 42.68 40.22"');
  expect(polygonPoints).toEqual(suppliedPolygonPoints);
});
