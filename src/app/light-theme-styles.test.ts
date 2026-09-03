import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const globalsPath = resolve(projectRoot, 'src/app/globals.css');
const globals = readFileSync(globalsPath, 'utf8');

const moduleTokenContracts = {
  'src/app/marketing.module.css': [
    '--surface-base',
    '--text-secondary',
    '--signal-copy',
  ],
  'src/components/marketing/MarketingBlocks.module.css': [
    '--surface-base',
    '--surface-alternate',
    '--text-primary',
    '--line-default',
    '--grid-color',
  ],
  'src/components/form-controls/FormControls.module.css': [
    '--field-surface',
    '--text-on-alternate',
    '--line-on-alternate',
    '--focus-ring',
  ],
  'src/components/icons/ProtocolIcon/ProtocolIcon.module.css': [
    '--protocol-chip-surface',
    '--protocol-chip-line',
    '--protocol-chip-shadow',
  ],
  'src/components/icons/ProtocolIconList/ProtocolIconList.module.css': [
    '--text-primary',
    '--signal-copy',
    '--line-default',
  ],
  'src/components/site/BackToTop.module.css': [
    '--utility-surface',
    '--utility-line',
    '--focus-ring',
  ],
  'src/components/ui/BackgroundBeams.module.css': [
    '--surface-base',
    '--line-strong',
    '--glow-color',
  ],
  'src/components/ui/GlowLink.module.css': [
    '--action-surface',
    '--action-text',
    '--focus-ring',
  ],
  'src/components/ui/SubmissionForm.module.css': [
    '--surface-alternate',
    '--text-on-alternate',
    '--line-on-alternate',
    '--panel-shadow',
  ],
  'src/components/elements/FlowLoadingOverlay/FlowLoadingOverlay.module.css': [
    '--overlay-surface',
    '--overlay-line',
    '--signal',
  ],
  'src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.module.css': [
    '--burst-shadow',
    '--signal',
  ],
} as const;

function getThemeBlock(theme: 'dark' | 'light') {
  return globals.match(
    new RegExp(`html\\[data-theme='${theme}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
  )?.[1] ?? '';
}

describe('system-aware stylesheet contract', () => {
  it('defines the complete semantic palette for both resolved themes', () => {
    const required = [
      '--surface-base', '--surface-soft', '--surface-elevated', '--surface-alternate',
      '--text-primary', '--text-secondary', '--text-muted', '--text-inverse',
      '--line-default', '--line-strong', '--signal', '--signal-strong', '--on-signal',
      '--header-surface', '--header-edge', '--focus-ring', '--selection-background',
      '--grid-color', '--glow-color',
    ];
    const darkBlock = getThemeBlock('dark');
    const lightBlock = getThemeBlock('light');

    for (const token of required) {
      expect(darkBlock, `dark theme is missing ${token}`).toContain(token);
      expect(lightBlock, `light theme is missing ${token}`).toContain(token);
    }

    expect(globals).toContain("html[data-theme='light']");
    expect(globals).toContain(':root:not([data-theme])');
    expect(globals).toContain('@media (prefers-color-scheme: light)');
    expect(globals).toContain("html[data-theme-ready='true']");
  });

  it('keeps theme decisions global while components consume semantic roles', () => {
    for (const [relativePath, tokens] of Object.entries(moduleTokenContracts)) {
      const stylesheet = readFileSync(resolve(projectRoot, relativePath), 'utf8');

      expect(stylesheet, `${relativePath} must not define a theme branch`)
        .not.toMatch(/(?:html|:root)[^{]*\[data-theme(?:=|\])/);
      for (const token of tokens) {
        expect(stylesheet, `${relativePath} is missing ${token}`).toContain(`var(${token}`);
      }
    }
  });
});
