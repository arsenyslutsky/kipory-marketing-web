import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('keeps the landing flow scale independent from vertical viewport changes', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');
  const heroVisualHeights = [...css.matchAll(/\.heroVisual\s*{([^}]*)}/g)].map(([, declarations]) => {
    const height = declarations?.match(/(?:^|;)\s*height\s*:\s*([^;]+)/)?.[1];
    return height?.trim();
  });

  expect(heroVisualHeights).toEqual(['840px', '1014px', '780px']);
  expect(heroVisualHeights.every((height) => !/[dlsv]vh\b/.test(height ?? ''))).toBe(true);
});

it('anchors the desktop landing flow to the hero bottom', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');
  const heroVisualRules = [...css.matchAll(/\.heroVisual\s*{([^}]*)}/g)].map(([, declarations]) => ({
    inset: declarations?.match(/(?:^|;)\s*inset\s*:\s*([^;]+)/)?.[1]?.trim(),
    transform: declarations?.match(/(?:^|;)\s*transform\s*:\s*([^;]+)/)?.[1]?.trim(),
  }));

  expect(heroVisualRules[0]).toEqual({
    inset: 'auto 0 0',
    transform: 'translateX(clamp(264px, 13vw, 284px))',
  });
  expect(heroVisualRules[1]?.inset).toBe('0 0 auto');
});
