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
    '--final-actions-edge',
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
    '--action-highlight-idle',
    '--action-highlight-interactive',
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
      '--grid-color', '--glow-color', '--action-highlight-idle',
      '--action-highlight-interactive', '--final-actions-edge',
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

  it('locks the approved Cold Paper Blueprint light anchors', () => {
    const lightBlock = getThemeBlock('light');
    const approvedAnchors = {
      '--surface-base': '#f3f5ef',
      '--surface-soft': '#e7ebe2',
      '--surface-elevated': '#f8faf5',
      '--surface-alternate': '#dfe9dd',
      '--text-primary': '#111511',
      '--text-secondary': '#3f4a40',
      '--text-muted': '#5d695e',
      '--text-inverse': '#f3f5ef',
      '--line-default': 'rgb(34 48 35 / 16%)',
      '--line-strong': 'rgb(25 40 27 / 32%)',
      '--signal': '#449c40',
      '--signal-strong': '#2f702c',
      '--on-signal': '#f3f5ef',
      '--header-surface': 'rgb(243 245 239 / 82%)',
      '--header-edge': 'rgb(25 40 27 / 18%)',
      '--focus-ring': '#2f702c',
      '--selection-background': '#b7d9b3',
      '--grid-color': 'rgb(45 70 47 / 10%)',
      '--glow-color': 'rgb(68 156 64 / 18%)',
    } as const;

    for (const [token, value] of Object.entries(approvedAnchors)) {
      expect(lightBlock, `${token} must retain its approved value`)
        .toContain(`${token}: ${value};`);
    }
  });

  it('covers unresolved no-script System snapshots without overriding resolved themes', () => {
    expect(globals).toContain(
      "html[data-theme='dark'][data-theme-preference='system']:not([data-theme-ready='true'])",
    );
    expect(globals).not.toContain(
      "html[data-theme='dark'][data-theme-preference='dark']:not([data-theme-ready='true'])",
    );
    expect(globals).not.toContain(
      "html[data-theme='light'][data-theme-preference='light']:not([data-theme-ready='true'])",
    );
  });

  it('selects mobile fallback image families on each image after the root theme is prepainted', () => {
    expect(globals).toMatch(
      /html\[data-theme='light'\] \[data-mobile-workflow-fallback\] img\s*\{[^}]*--mobile-workflow-selected-image: var\(--mobile-workflow-light-image\);/,
    );
    expect(globals).toMatch(
      /\[data-mobile-workflow-fallback\] img\s*\{[^}]*--mobile-workflow-selected-image: var\(--mobile-workflow-dark-image\);/,
    );
    expect(globals).toMatch(
      /\[data-mobile-workflow-fallback\]\[data-mode='light'\] img\s*\{[^}]*--mobile-workflow-selected-image: var\(--mobile-workflow-light-image\);/,
    );
  });

  it('gates theme transitions by readiness and preserves accessibility fallbacks', () => {
    expect(globals).toMatch(
      /html\[data-theme-ready='true'\] body,[\s\S]*?transition:\s*color 180ms/,
    );
    expect(globals).toMatch(
      /@media \(prefers-reduced-transparency: reduce\)[\s\S]*?\.site-header\s*\{[^}]*background: var\(--surface-base\);[^}]*backdrop-filter: none;/,
    );
    expect(globals).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?html\[data-theme-ready='true'\] body,[\s\S]*?transition: none;/,
    );
  });

  it('retains the dark GlowLink sheen and final-action edge through theme tokens', () => {
    const darkBlock = getThemeBlock('dark');
    const lightBlock = getThemeBlock('light');

    expect(darkBlock).toContain(
      '--action-highlight-idle: color-mix(in srgb, var(--text-primary) 8%, transparent);',
    );
    expect(darkBlock).toContain(
      '--action-highlight-interactive: color-mix(in srgb, var(--text-primary) 12%, transparent);',
    );
    expect(darkBlock).toContain('--final-actions-edge: transparent;');
    expect(darkBlock).toContain('--header-action-hover-surface: var(--header-action-surface);');
    expect(darkBlock).toContain('--outline-control-hover-surface: var(--outline-control-surface);');
    expect(darkBlock).toContain('--learn-more-hover-color: var(--signal-copy);');
    expect(darkBlock).toContain('--learn-more-hover-decoration: transparent;');
    expect(lightBlock).toContain(
      '--action-highlight-idle: color-mix(in srgb, var(--text-inverse) 12%, transparent);',
    );
    expect(lightBlock).toContain(
      '--action-highlight-interactive: color-mix(in srgb, var(--text-inverse) 12%, transparent);',
    );
    expect(lightBlock).toContain('--final-actions-edge: var(--line-default);');
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
