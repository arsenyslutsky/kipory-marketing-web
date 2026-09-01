import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const globalCss = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

it('uses the Outfit display face for the shared Kipory wordmark', () => {
  const brandRule = globalCss.match(/^\.brand\s*\{([^}]*)\}/m)?.[1] ?? '';

  expect(brandRule).toContain('font-family: var(--type-display-family);');
});
