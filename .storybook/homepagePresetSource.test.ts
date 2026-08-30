import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { expect, it } from 'vitest';

import {
  getHomepagePresetTarget,
  rewriteHomepagePresetSource,
  saveHomepagePreset,
} from './homepagePresetSource';

const validSource = `import type { Props } from './types';

export const demo = {
  color: '#fff',
  speed: 1.4,
  enabled: true,
} satisfies Props;
`;

it('merges partial primitive args while preserving imports, omitted values, and key order', () => {
  expect(rewriteHomepagePresetSource(validSource, 'demo', { speed: 0.5 })).toBe(
    `import type { Props } from './types';

export const demo = {
  color: '#fff',
  speed: 0.5,
  enabled: true,
} satisfies Props;
`,
  );
});

it('serializes apostrophes and control characters safely in project quote style', () => {
  const source = "export const demo = { label: 'old' } satisfies Props;\n";
  expect(rewriteHomepagePresetSource(source, 'demo', { label: "it's\nsafe" })).toBe(
    "export const demo = {\n  label: 'it\\'s\\nsafe',\n} satisfies Props;\n",
  );
});

it('updates literal primitive arrays submitted by Storybook controls', () => {
  const source = `export const demo = {
  gap: 40,
  variants: ['rest', 'mcp'],
} satisfies Props;
`;

  expect(rewriteHomepagePresetSource(source, 'demo', {
    gap: 48,
    variants: ['rest', 'sse', 'mcp'],
  })).toBe(`export const demo = {
  gap: 48,
  variants: ['rest', 'sse', 'mcp'],
} satisfies Props;
`);
});

it.each([
  ['unknown key', { missing: 1 }, 'Unknown preset property'],
  ['type change', { speed: 'fast' }, 'must remain a number'],
  ['nested value', { speed: { value: 1 } }, 'must be a string, finite number, or boolean'],
  ['non-finite value', { speed: Number.POSITIVE_INFINITY }, 'must be finite'],
])('rejects %s', (_label, args, message) => {
  expect(() => rewriteHomepagePresetSource(validSource, 'demo', args)).toThrow(message);
});

it.each([
  [
    'duplicate export',
    `export const demo = { speed: 1 };\nexport const demo = { speed: 2 };`,
    'exactly one exported preset',
  ],
  ['spread property', 'export const demo = { ...base } satisfies Props;', 'property assignments'],
  [
    'computed property',
    "export const demo = { ['speed']: 1 } satisfies Props;",
    'static property name',
  ],
  ['shorthand property', 'export const demo = { speed } satisfies Props;', 'property assignments'],
  [
    'unsupported initializer',
    'export const demo = { speed: defaultSpeed } satisfies Props;',
    'literal primitives',
  ],
  [
    'duplicate property',
    'export const demo = { speed: 1, speed: 2 } satisfies Props;',
    'duplicate property',
  ],
])('rejects a source containing %s', (_label, source, message) => {
  expect(() => rewriteHomepagePresetSource(source, 'demo', {})).toThrow(message);
});

it.each([
  [
    'animated-illustrations-businessflow3d--current-nextjs-app' as const,
    'src/features/business-flow-3d/presets.ts',
    'businessFlow3DHomepageProps',
  ],
  [
    'animated-illustrations-businessflowvertical--current-nextjs-app' as const,
    'src/features/business-flow-vertical/presets.ts',
    'businessFlowVerticalHomepageProps',
  ],
  [
    'animated-illustrations-businessflowhorizontal--current-nextjs-app' as const,
    'src/features/business-flow-horizontal/presets.ts',
    'businessFlowHorizontalHomepageProps',
  ],
  [
    'ui-glowlink--current-nextjs-app' as const,
    'src/components/ui/GlowLink.presets.ts',
    'glowLinkHomepageProps',
  ],
  ['marketing-sitecontainer--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'siteContainerHomepageProps'],
  ['marketing-section--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'marketingSectionHomepageProps'],
  ['marketing-splitlayout--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'splitLayoutHomepageProps'],
  ['marketing-pagehero--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'pageHeroHomepageProps'],
  ['marketing-sectionheader--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'sectionHeaderHomepageProps'],
  ['marketing-numberedrow--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'numberedRowHomepageProps'],
  ['marketing-formfield--current-nextjs-app' as const, 'src/components/marketing/presets.ts', 'formFieldHomepageProps'],
  [
    'icons-protocoliconlist--current-nextjs-app' as const,
    'src/components/icons/ProtocolIconList/presets.ts',
    'protocolIconListHomepageProps',
  ],
])('maps %s to its canonical preset', (storyId, relativePath, exportName) => {
  expect(getHomepagePresetTarget(storyId)).toEqual({ relativePath, exportName });
});

it('atomically saves only the registered preset and leaves invalid saves unchanged', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-homepage-preset-'));
  const target = getHomepagePresetTarget(
    'animated-illustrations-businessflowhorizontal--current-nextjs-app',
  );
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `import type { Props } from './types';

export const businessFlowHorizontalHomepageProps = {
  connectorOpacity: 0.22,
  beamEnabled: true,
} satisfies Props;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await saveHomepagePreset(
      projectRoot,
      'animated-illustrations-businessflowhorizontal--current-nextjs-app',
      { connectorOpacity: 0.64 },
    );

    const savedSource = await readFile(targetPath, 'utf8');
    expect(savedSource).toContain('connectorOpacity: 0.64');
    expect(savedSource).toContain('beamEnabled: true');
    expect(await readdir(dirname(targetPath))).toEqual(['presets.ts']);
    await expect(
      readFile(join(projectRoot, 'src/features/business-flow-3d/presets.ts'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });

    await expect(
      saveHomepagePreset(
        projectRoot,
        'animated-illustrations-businessflowhorizontal--current-nextjs-app',
        { connectorOpacity: { nested: true } },
      ),
    ).rejects.toThrow('must be a string, finite number, or boolean');
    expect(await readFile(targetPath, 'utf8')).toBe(savedSource);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it('persists GlowLink control values into the registered homepage preset', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-glow-link-preset-'));
  const target = getHomepagePresetTarget('ui-glowlink--current-nextjs-app');
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `import type { GlowLinkVisualProps } from './GlowLink';

export const glowLinkHomepageProps = {
  glowActive: false,
  glowBlur: 15,
  glowColor: '#449c40',
} satisfies GlowLinkVisualProps;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await saveHomepagePreset(projectRoot, 'ui-glowlink--current-nextjs-app', {
      glowActive: true,
      glowBlur: 24,
      glowColor: '#5fd85a',
    });

    expect(await readFile(targetPath, 'utf8')).toBe(
      `import type { GlowLinkVisualProps } from './GlowLink';

export const glowLinkHomepageProps = {
  glowActive: true,
  glowBlur: 24,
  glowColor: '#5fd85a',
} satisfies GlowLinkVisualProps;
`,
    );
    expect(await readdir(dirname(targetPath))).toEqual(['GlowLink.presets.ts']);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it('updates one marketing block preset without changing its sibling presets', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-marketing-block-preset-'));
  const target = getHomepagePresetTarget('marketing-pagehero--current-nextjs-app');
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `export const siteContainerHomepageProps = {
  maxWidth: 1180,
} satisfies Props;

export const pageHeroHomepageProps = {
  paddingTop: 164,
  paddingBottom: 96,
} satisfies Props;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await saveHomepagePreset(projectRoot, 'marketing-pagehero--current-nextjs-app', {
      paddingTop: 176,
    });

    expect(await readFile(targetPath, 'utf8')).toBe(`export const siteContainerHomepageProps = {
  maxWidth: 1180,
} satisfies Props;

export const pageHeroHomepageProps = {
  paddingTop: 176,
  paddingBottom: 96,
} satisfies Props;
`);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it('serializes concurrent saves that target different exports in one preset file', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-concurrent-marketing-presets-'));
  const target = getHomepagePresetTarget('marketing-pagehero--current-nextjs-app');
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `export const siteContainerHomepageProps = {
  maxWidth: 1180,
} satisfies Props;

export const pageHeroHomepageProps = {
  paddingTop: 164,
} satisfies Props;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await Promise.all([
      saveHomepagePreset(projectRoot, 'marketing-sitecontainer--current-nextjs-app', {
        maxWidth: 1240,
      }),
      saveHomepagePreset(projectRoot, 'marketing-pagehero--current-nextjs-app', {
        paddingTop: 176,
      }),
    ]);

    const savedSource = await readFile(targetPath, 'utf8');
    expect(savedSource).toContain('maxWidth: 1240');
    expect(savedSource).toContain('paddingTop: 176');
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});
