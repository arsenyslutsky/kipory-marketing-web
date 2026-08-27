import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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
