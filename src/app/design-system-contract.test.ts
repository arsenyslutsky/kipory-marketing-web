import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const sourceRoot = resolve(projectRoot, 'src');

function collectCssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectCssFiles(path) : entry.name.endsWith('.css') ? [path] : [];
  });
}

function collectImplementationFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectImplementationFiles(path);
    if (!/\.(?:ts|tsx)$/.test(entry.name) || /\.(?:test|stories)\./.test(entry.name)) return [];
    return [path];
  });
}

function displayPath(path: string) {
  return relative(projectRoot, path);
}

function declarations(source: string, property: string) {
  return [...source.matchAll(new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;}]+)`, 'gm'))]
    .map((match) => match[1].trim());
}

const cssFiles = collectCssFiles(sourceRoot);
const typographyPath = resolve(sourceRoot, 'app/typography.css');
const uiColorPaths = [
  resolve(sourceRoot, 'app/globals.css'),
  typographyPath,
  resolve(sourceRoot, 'app/marketing.module.css'),
  resolve(sourceRoot, 'components/marketing/MarketingBlocks.module.css'),
  resolve(sourceRoot, 'components/site/BackToTop.module.css'),
  resolve(sourceRoot, 'components/ui/GlowLink.module.css'),
  resolve(sourceRoot, 'components/ui/SubmissionForm.module.css'),
  resolve(sourceRoot, 'stories/Typography.stories.module.css'),
];

describe('design-system token contract', () => {
  it('routes every authored font size through the typography scale', () => {
    const violations = cssFiles.flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      const fontSizes = declarations(source, 'font-size')
        .filter((value) => !value.startsWith('var(--type-'));
      const fontShorthands = declarations(source, 'font')
        .filter((value) => /(?:^|\s)(?:\d|\.)+(?:px|rem|em)\//.test(value));

      return [...fontSizes, ...fontShorthands].map((value) => `${displayPath(path)}: ${value}`);
    });

    expect(violations).toEqual([]);
  });

  it('keeps every declared typography token in active use', () => {
    const source = readFileSync(typographyPath, 'utf8');
    const tokens = [...source.matchAll(/--(type-[a-z0-9-]+)\s*:/g)].map((match) => match[1]);
    const allCss = cssFiles.map((path) => readFileSync(path, 'utf8')).join('\n');
    const unused = tokens.filter((token) => {
      const references = allCss.match(new RegExp(`var\\(--${token}\\)`, 'g')) ?? [];
      return references.length === 0;
    });

    expect(unused).toEqual([]);
  });

  it('keeps interface colors in the shared palette instead of component literals', () => {
    const colorLiteral = /#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)|(?<!-)\b(?:black|white)\b(?!-)/gi;
    const violations = uiColorPaths.flatMap((path) => {
      let source = readFileSync(path, 'utf8');
      if (path.endsWith('globals.css')) {
        const globalRulesStart = source.indexOf('* { box-sizing: border-box; }');
        source = globalRulesStart >= 0 ? source.slice(globalRulesStart) : source;
      }

      return [...source.matchAll(colorLiteral)].map((match) => (
        `${displayPath(path)}:${source.slice(0, match.index).split('\n').length}: ${match[0]}`
      ));
    });

    expect(violations).toEqual([]);
  });

  it('keeps every declared palette color in active use', () => {
    const globalsPath = resolve(sourceRoot, 'app/globals.css');
    const source = readFileSync(globalsPath, 'utf8');
    const globalRulesStart = source.indexOf('* { box-sizing: border-box; }');
    const palette = globalRulesStart >= 0 ? source.slice(0, globalRulesStart) : source;
    const colorTokens = [...new Set(
      [...palette.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch)\([^;]+\))/gi)]
        .map((match) => match[1]),
    )];
    const allCss = cssFiles.map((path) => readFileSync(path, 'utf8')).join('\n');
    const unused = colorTokens.filter((token) => {
      const references = allCss.match(new RegExp(`var\\(--${token}\\)`, 'g')) ?? [];
      return references.length === 0;
    });

    expect(unused).toEqual([]);
  });

  it('keeps production flow colors in the shared illustration palette', () => {
    const implementationFiles = [
      ...collectImplementationFiles(resolve(sourceRoot, 'components/elements')),
      ...collectImplementationFiles(resolve(sourceRoot, 'features')),
    ].filter((path) => !path.endsWith('business-flow-palette.ts'));
    const colorLiteral = /#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)/gi;
    const violations = implementationFiles.flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return [...source.matchAll(colorLiteral)].map((match) => (
        `${displayPath(path)}:${source.slice(0, match.index).split('\n').length}: ${match[0]}`
      ));
    });

    expect(violations).toEqual([]);
  });
});
