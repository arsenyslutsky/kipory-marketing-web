import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/ui/GlowLink.module.css'),
  'utf8',
);

it('uses Carbon Ink text on the Signal Green GlowLink surface', () => {
  const surfaceRule = stylesheet.match(/^\.surface \{([^}]*)\}/m)?.[1];

  expect(surfaceRule).toContain('color: var(--ink);');
});
