import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const brandColors = ['#2f702c', '#449c40'];
const suppliedPolygonPoints = [
  '12.1 30.2 12.1 .8 .1 10.6 0 39.7 12.1 30.2',
  '42.7 40.2 25.2 37.1 12.5 20.1 27.6 20.1 42.7 40.2',
  '42.7 0 24.8 3.8 12.5 20.1 27.6 20.1 42.7 0',
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

  expect(symbol.match(/<linearGradient\b/g)).toHaveLength(3);
  expect(stopColors).toContain('#449c40');
  expect(stopColors).toContain('#2f702c');
  expect([...new Set(stopColors)].sort()).toEqual(brandColors);
});

it('is a standalone, accessible Kipory symbol with the supplied polygon geometry', () => {
  const symbol = readKiporySymbol();
  const polygonPoints = [...symbol.matchAll(/<polygon[^>]+points="([^"]+)"/g)]
    .map((match) => match[1]);

  expect(symbol).toContain('viewBox="0 0 42.7 40.2"');
  expect(symbol).toContain('<title id="kipory-symbol-title">Kipory</title>');
  expect(symbol).toContain('aria-labelledby="kipory-symbol-title"');
  expect(symbol.match(/<polygon\b/g)).toHaveLength(3);
  expect(symbol).not.toMatch(/Adobe Illustrator|<symbol\b|<use\b|xlink:href|translate\(/);
  expect(symbol).not.toMatch(/<path\b/);
  expect(polygonPoints).toEqual(suppliedPolygonPoints);
});
