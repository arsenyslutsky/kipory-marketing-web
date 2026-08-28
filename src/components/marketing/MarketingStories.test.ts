import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, it } from 'vitest';

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
