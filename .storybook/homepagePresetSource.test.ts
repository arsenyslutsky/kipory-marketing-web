import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

import { expect, it } from 'vitest';

import {
  getHomepagePresetTarget,
  rewriteHomepagePresetSource,
  saveHomepagePreset,
} from './homepagePresetSource';

it.each([
  ['hero', 'heroBackgroundHomepageProps'],
  ['our-pillars', 'pillarsBackgroundHomepageProps'],
  ['delivery', 'deliveryBackgroundHomepageProps'],
  ['hero-light', 'heroBackgroundHomepageProps'],
  ['our-pillars-light', 'pillarsBackgroundHomepageProps'],
  ['delivery-light', 'deliveryBackgroundHomepageProps'],
] as const)('saves the %s background independently and rejects variant changes', async (slug, exportName) => {
  const storyId = `marketing-masked-background--${slug}` as Parameters<typeof getHomepagePresetTarget>[0];
  const relativePath = 'src/components/marketing/MaskedBackground.presets.ts';
  expect(getHomepagePresetTarget(storyId)).toEqual({ relativePath, exportName });
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-background-preset-'));
  const targetPath = join(projectRoot, relativePath);
  const evaluatePresets = (source: string) => {
    const exports: Record<string, Record<string, number | boolean | string>> = {};
    runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
    return exports;
  };

  try {
    const original = await readFile(join(process.cwd(), relativePath), 'utf8');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, original);
    const before = evaluatePresets(original);
    const invert = !before[exportName].invert;
    await saveHomepagePreset(projectRoot, storyId, { maskWidth: 500, maskHeight: 50, invert, maskShape: 'ellipsis', maskOpacity: 0, maskCenterX: 0, maskCenterY: 100 });
    const savedSource = await readFile(targetPath, 'utf8');
    const after = evaluatePresets(savedSource);
    expect(after[exportName]).toMatchObject({ maskWidth: 500, maskHeight: 50 });
    expect(after[exportName].invert).toBe(invert);
    expect(after[exportName]).toMatchObject({ maskShape: 'ellipsis', maskOpacity: 0, maskCenterX: 0, maskCenterY: 100 });
    for (const name of Object.keys(before).filter(name => name !== exportName)) {
      expect(after[name]).toEqual(before[name]);
    }
    await expect(saveHomepagePreset(projectRoot, storyId, { variant: 'delivery' })).rejects.toThrow('Unknown preset property variant');
    expect(await readFile(targetPath, 'utf8')).toBe(savedSource);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

it.each(['hero', 'hero-light'] as const)('saves %s base settings atomically without changing the other theme', async slug => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-hero-base-'));
  const relativePath = 'src/components/marketing/MaskedBackground.presets.ts';
  const targetPath = join(projectRoot, relativePath);
  const storyId = `marketing-masked-background--${slug}` as const;
  const evaluate = (source: string) => {
    const exports: Record<string, Record<string, unknown>> = {};
    runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
    return exports;
  };
  try {
    const original = await readFile(join(process.cwd(), relativePath), 'utf8');
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, original);
    const before = evaluate(original);
    const selected = slug === 'hero' ? 'heroBaseBackgroundDarkProps' : 'heroBaseBackgroundLightProps';
    await saveHomepagePreset(projectRoot, storyId, { maskWidth: 222, colorFrom: '#112233', colorTo: '#445566', style: 'linear', angle: 45 });
    const saved = await readFile(targetPath, 'utf8');
    const after = evaluate(saved);
    expect(after[selected]).toEqual({ colorFrom: '#112233', colorTo: '#445566', style: 'linear', angle: 45 });
    expect(after.heroBackgroundHomepageProps).toEqual({ ...before.heroBackgroundHomepageProps, maskWidth: 222 });
    for (const key of Object.keys(before).filter(key => ![selected, 'heroBackgroundHomepageProps'].includes(key))) {
      expect(after[key]).toEqual(before[key]);
    }
    await expect(saveHomepagePreset(projectRoot, storyId, { maskWidth: 333, angle: 'bad' })).rejects.toThrow();
    expect(await readFile(targetPath, 'utf8')).toBe(saved);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

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

it('updates controlled palette expressions while preserving untouched expressions', () => {
  const source = `import { palette } from './palette';

export const demo = {
  primaryColor: palette.primary,
  secondaryColor: palette.secondary,
  speed: 1.4,
} satisfies Props;
`;

  expect(rewriteHomepagePresetSource(source, 'demo', {
    primaryColor: '#55aa44',
    speed: 0.8,
  })).toBe(`import { palette } from './palette';

export const demo = {
  primaryColor: '#55aa44',
  secondaryColor: palette.secondary,
  speed: 0.8,
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
    'businessFlow3DHomepageDarkProps',
  ],
  [
    'animated-illustrations-businessflow3d--current-app-light' as Parameters<typeof getHomepagePresetTarget>[0],
    'src/features/business-flow-3d/presets.ts',
    'businessFlow3DHomepageLightProps',
  ],
  [
    'animated-illustrations-businessflowvertical--current-nextjs-app' as const,
    'src/features/business-flow-vertical/presets.ts',
    'businessFlowVerticalHomepageDarkProps',
  ],
  [
    'animated-illustrations-businessflowvertical--current-app-light' as const,
    'src/features/business-flow-vertical/presets.ts',
    'businessFlowVerticalHomepageLightProps',
  ],
  [
    'animated-illustrations-businessflowhorizontal--current-nextjs-app' as const,
    'src/features/business-flow-horizontal/presets.ts',
    'businessFlowHorizontalHomepageDarkProps',
  ],
  [
    'animated-illustrations-businessflowhorizontal--current-app-light' as const,
    'src/features/business-flow-horizontal/presets.ts',
    'businessFlowHorizontalHomepageLightProps',
  ],
  [
    'animated-illustrations-businesscorenodeflow--current-nextjs-app' as const,
    'src/features/business-core-node-flow/presets.ts',
    'businessCoreNodeFlowContactProps',
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

it('maps Current Next.js App 2 to the independent waitlist core-flow preset', () => {
  const storyId = (
    'animated-illustrations-businesscorenodeflow--current-nextjs-app-2'
  ) as Parameters<typeof getHomepagePresetTarget>[0];

  expect(getHomepagePresetTarget(storyId)).toEqual({
    relativePath: 'src/features/business-core-node-flow/presets.ts',
    exportName: 'businessCoreNodeFlowWaitlistProps',
  });
});

it('atomically saves only the registered preset and leaves invalid saves unchanged', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-homepage-preset-'));
  const target = getHomepagePresetTarget(
    'animated-illustrations-businessflowhorizontal--current-nextjs-app',
  );
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `import type { Props } from './types';

export const businessFlowHorizontalHomepageDarkProps = {
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

it('saves dark and light horizontal homepage controls to independent exports', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-themed-horizontal-presets-'));
  const darkStoryId = 'animated-illustrations-businessflowhorizontal--current-nextjs-app' as const;
  const lightStoryId = 'animated-illustrations-businessflowhorizontal--current-app-light' as const;
  const target = getHomepagePresetTarget(darkStoryId);
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `export const businessFlowHorizontalHomepageDarkProps = {
  outlineOpacity: 0,
  nodeShadowOpacity: 0.5,
} satisfies Props;

export const businessFlowHorizontalHomepageLightProps = {
  outlineOpacity: 0.3,
  nodeShadowOpacity: 0.38,
} satisfies Props;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await saveHomepagePreset(projectRoot, darkStoryId, { outlineOpacity: 0.2 });
    await saveHomepagePreset(projectRoot, lightStoryId, {
      outlineOpacity: 0.7,
      nodeShadowOpacity: 0.31,
    });

    expect(await readFile(targetPath, 'utf8')).toBe(
      `export const businessFlowHorizontalHomepageDarkProps = {
  outlineOpacity: 0.2,
  nodeShadowOpacity: 0.5,
} satisfies Props;

export const businessFlowHorizontalHomepageLightProps = {
  outlineOpacity: 0.7,
  nodeShadowOpacity: 0.31,
} satisfies Props;
`,
    );
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

it('saves dark and light 3D homepage controls to independent exports', async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), 'kipory-themed-3d-presets-'));
  const darkStoryId = 'animated-illustrations-businessflow3d--current-nextjs-app' as const;
  const lightStoryId = 'animated-illustrations-businessflow3d--current-app-light' as const;
  const target = getHomepagePresetTarget(darkStoryId);
  const targetPath = join(projectRoot, target.relativePath);
  const initialSource = `export const businessFlow3DHomepageDarkProps = {
  gridOpacity: 0.1,
  cameraZoom: 1.1,
} satisfies Props;

export const businessFlow3DHomepageLightProps = {
  gridOpacity: 0.1,
  cameraZoom: 1.1,
} satisfies Props;
`;

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, initialSource, 'utf8');

    await saveHomepagePreset(projectRoot, darkStoryId, { cameraZoom: 0.9 });
    await saveHomepagePreset(projectRoot, lightStoryId, { gridOpacity: 0.25 });

    expect(await readFile(targetPath, 'utf8')).toBe(
      `export const businessFlow3DHomepageDarkProps = {
  gridOpacity: 0.1,
  cameraZoom: 0.9,
} satisfies Props;

export const businessFlow3DHomepageLightProps = {
  gridOpacity: 0.25,
  cameraZoom: 1.1,
} satisfies Props;
`,
    );
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
