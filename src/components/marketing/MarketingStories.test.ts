import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import preview from '../../../.storybook/preview';
import beam3DMeta from '../elements/Beam3D/Beam3D.stories';
import connector3DMeta from '../elements/Connector3D/Connector3D.stories';
import node3DMeta from '../elements/Node3D/Node3D.stories';
import businessCoreNodeFlowMeta from '../../features/business-core-node-flow/stories/BusinessCoreNodeFlow.stories';
import businessFlow3DMeta from '../../features/business-flow-3d/stories/BusinessFlow3D.stories';
import businessFlowHorizontalMeta from '../../features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import businessFlowVerticalMeta from '../../features/business-flow-vertical/stories/BusinessFlowVertical.stories';

it('provides System, Light, and Dark canvas theme preferences', () => {
  expect(preview.globalTypes?.theme?.toolbar?.items).toEqual([
    expect.objectContaining({ value: 'system', title: 'System', icon: 'browser' }),
    expect.objectContaining({ value: 'light', title: 'Light', icon: 'sun' }),
    expect.objectContaining({ value: 'dark', title: 'Dark', icon: 'moon' }),
  ]);
  expect(preview.initialGlobals).toMatchObject({ theme: 'system' });
});

it('lets ordinary WebGL foundation stories inherit the canvas theme', () => {
  [
    beam3DMeta,
    connector3DMeta,
    node3DMeta,
    businessCoreNodeFlowMeta,
    businessFlow3DMeta,
    businessFlowHorizontalMeta,
    businessFlowVerticalMeta,
  ].forEach((meta) => expect(meta.args).not.toHaveProperty('mode'));
});

const adjustableStories = [
  'SiteContainer',
  'MarketingSection',
  'SplitLayout',
  'PageHero',
  'SectionHeader',
  'NumberedRow',
  'FormField',
] as const;

for (const name of adjustableStories) {
  it(`${name} exposes Foundation and persisted Current Next.js App stories`, async () => {
    const source = await readFile(join(process.cwd(), 'src/components/marketing', `${name}.stories.tsx`), 'utf8');

    expect(source).toContain('export const Foundation');
    expect(source).toContain('export const CurrentNextjsApp');
    expect(source).toContain('homepagePreset: { keys: Object.keys(');
  });
}

for (const name of ['SiteHeader', 'SiteFooter'] as const) {
  it(`${name} has a reusable Storybook fixture`, async () => {
    const source = await readFile(join(process.cwd(), 'src/components/site', `${name}.stories.tsx`), 'utf8');

    expect(source).toContain(`component: ${name}`);
    expect(source).toContain('export const CurrentNextjsApp');
  });
}
