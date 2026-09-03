import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/ui/GlowLink.module.css'),
  'utf8',
);

it('uses the resolved action text on the resolved action surface', () => {
  const surfaceRule = stylesheet.match(/^\.surface \{([^}]*)\}/m)?.[1];
  const interactiveSurfaceRule = stylesheet.match(
    /^\.link:hover \.surface,[\s\S]*?\{([^}]*)\}/m,
  )?.[1];

  expect(surfaceRule).toContain('color: var(--action-text);');
  expect(surfaceRule).toContain('var(--action-highlight)');
  expect(surfaceRule).toContain('var(--action-surface);');
  expect(interactiveSurfaceRule).toContain('var(--action-highlight)');
});
