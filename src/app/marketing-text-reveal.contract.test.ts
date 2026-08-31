import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const marketingCss = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');

it('releases conversion-page text reveal masks after the entrance animation', () => {
  const textRevealRule = marketingCss.match(/\.pageTextReveal\s*\{([^}]*)\}/)?.[1] ?? '';

  expect(textRevealRule).toMatch(/animation:\s*heroSignalReveal 560ms[^;]*backwards/);
});
