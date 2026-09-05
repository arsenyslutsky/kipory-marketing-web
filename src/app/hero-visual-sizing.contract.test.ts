import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('keeps the landing flow scale independent from vertical viewport changes', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');
  const heroVisualHeights = [...css.matchAll(/\.heroVisual\s*{([^}]*)}/g)].map(([, declarations]) => {
    const height = declarations?.match(/(?:^|;)\s*height\s*:\s*([^;]+)/)?.[1];
    return height?.trim();
  });

  expect(heroVisualHeights).toEqual(['840px', undefined, '1014px', '780px']);
  expect(heroVisualHeights.every((height) => !/[dlsv]vh\b/.test(height ?? ''))).toBe(true);
});

it('fits the landing flow into the intermediate width without changing its fixed-height host', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');
  const intermediateRule = css.match(/@media \(min-width: 901px\) and \(max-width: 1100px\)\s*{\s*\.heroVisual\s*{([^}]*)}/)?.[1];

  expect(intermediateRule).toBeDefined();
  expect(intermediateRule).not.toMatch(/\b(?:height|min-height|max-height)\s*:/);
  expect(intermediateRule).not.toMatch(/\b(?:min|max)-height\b|[dlsv]?vh\b/);
  expect(intermediateRule).not.toMatch(/\binset\s*:/);
  expect(intermediateRule).toMatch(/transform\s*:\s*translate3d\(186px, 350px, 0\) scale\(\.44\)/);
  expect(intermediateRule).toMatch(/transform-origin\s*:\s*center top/);
});

it('anchors the desktop landing flow to the hero bottom', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');
  const heroVisualRules = [...css.matchAll(/\.heroVisual\s*{([^}]*)}/g)].map(([, declarations]) => ({
    inset: declarations?.match(/(?:^|;)\s*inset\s*:\s*([^;]+)/)?.[1]?.trim(),
    transform: declarations?.match(/(?:^|;)\s*transform\s*:\s*([^;]+)/)?.[1]?.trim(),
  }));

  expect(heroVisualRules[0]).toEqual({
    inset: 'auto 0 0',
    transform: 'translateX(calc(clamp(264px, 13vw, 284px) - 240px))',
  });
  expect(heroVisualRules[2]?.inset).toBe('0 0 auto');
});
