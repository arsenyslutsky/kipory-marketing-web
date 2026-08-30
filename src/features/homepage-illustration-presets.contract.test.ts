import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessFlow3DHomepageProps } from './business-flow-3d/presets';
import { businessFlowHorizontalHomepageProps } from './business-flow-horizontal/presets';
import { businessFlowVerticalHomepageProps } from './business-flow-vertical/presets';

const cases = [
  {
    feature: 'business-flow-3d',
    preset: 'businessFlow3DHomepageProps',
    story: 'BusinessFlow3D',
  },
  {
    feature: 'business-flow-vertical',
    preset: 'businessFlowVerticalHomepageProps',
    story: 'BusinessFlowVertical',
  },
  {
    feature: 'business-flow-horizontal',
    preset: 'businessFlowHorizontalHomepageProps',
    story: 'BusinessFlowHorizontal',
  },
] as const;

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

describe('homepage illustration preset contract', () => {
  it('eagerly loads only the hero and defers both lower workflows near the viewport', () => {
    expect(businessFlow3DHomepageProps).toMatchObject({
      activityStrategy: 'visible',
      loadStrategy: 'eager',
      resolutionScale: 'display',
    });
    [businessFlowHorizontalHomepageProps, businessFlowVerticalHomepageProps].forEach((preset) => {
      expect(preset).toMatchObject({
        activityStrategy: 'visible',
        loadStrategy: 'near-viewport',
        preloadMargin: '600px 0px',
        resolutionScale: 'display',
      });
    });
  });

  it('keeps the pillars section out of progress-driven document geometry', () => {
    const marketingCss = source('../app/marketing.module.css');
    const movementRule = marketingCss.match(/\.movementSection\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(movementRule).not.toContain('margin-bottom');
    expect(movementRule).not.toContain('transform:');
    expect(movementRule).not.toContain('will-change');
  });

  it('keeps the hero height override stronger than the reusable viewport height', () => {
    const marketingCss = source('../app/marketing.module.css');
    const flowCss = source('./business-flow-3d/components/BusinessFlow3D.module.css');
    const heroRule = marketingCss.match(/^(\.heroVisual\s*>\s*[^\{]+)\{([^}]*)\}/m)?.slice(1) ?? [];
    const rootRule = flowCss.match(/^(\.root[^\{]*)\{([^}]*)\}/m)?.slice(1) ?? [];
    const countClassAndAttributeSelectors = (selector = '') => (
      selector.match(/\.[\w-]+|\[[^\]]+\]/g)?.length ?? 0
    );

    expect(heroRule[1]).toMatch(/height:\s*100%/);
    expect(heroRule[1]).toMatch(/min-height:\s*0/);
    expect(rootRule[1]).toMatch(/height:\s*100dvh/);
    expect(countClassAndAttributeSelectors(heroRule[0]))
      .toBeGreaterThan(countClassAndAttributeSelectors(rootRule[0]));
  });

  it.each(cases)('$feature exports one preset used by its website story', ({ feature, preset, story }) => {
    const presetSource = source(`./${feature}/presets.ts`);
    const indexSource = source(`./${feature}/index.ts`);
    const storySource = source(`./${feature}/stories/${story}.stories.tsx`);

    expect(presetSource).toContain(`export const ${preset} =`);
    expect(indexSource).toContain(`export { ${preset} } from './presets';`);
    expect(storySource).toContain(`import { ${preset} } from '../presets';`);
    expect(storySource).toMatch(new RegExp(
      `export const CurrentNextjsApp: Story = \\{[\\s\\S]*?args: ${preset}`,
    ));
  });
});
