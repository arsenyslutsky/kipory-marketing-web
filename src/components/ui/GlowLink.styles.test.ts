import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/ui/GlowLink.module.css'),
  'utf8',
);
const globals = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

function getThemeBlock(theme: 'dark' | 'light') {
  return globals.match(
    new RegExp(`html\\[data-theme='${theme}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
  )?.[1] ?? '';
}

it('uses the resolved action text on the resolved action surface', () => {
  const surfaceRule = stylesheet.match(/^\.surface \{([^}]*)\}/m)?.[1];

  expect(surfaceRule).toContain('color: var(--action-text);');
  expect(surfaceRule).toContain('var(--action-surface);');
});

it('preserves distinct pale idle and interactive highlights in dark mode', () => {
  const darkBlock = getThemeBlock('dark');
  const surfaceRule = stylesheet.match(/^\.surface \{([^}]*)\}/m)?.[1];
  const interactiveSurfaceRule = stylesheet.match(
    /^\.link:hover \.surface,[\s\S]*?\{([^}]*)\}/m,
  )?.[1];

  expect(darkBlock).toContain(
    '--action-highlight-idle: color-mix(in srgb, var(--text-primary) 8%, transparent);',
  );
  expect(darkBlock).toContain(
    '--action-highlight-interactive: color-mix(in srgb, var(--text-primary) 12%, transparent);',
  );
  expect(surfaceRule).toContain('var(--action-highlight-idle)');
  expect(surfaceRule).not.toContain('var(--action-highlight-interactive)');
  expect(interactiveSurfaceRule).toContain('var(--action-highlight-interactive)');
  expect(interactiveSurfaceRule).not.toContain('var(--action-highlight-idle)');
});
