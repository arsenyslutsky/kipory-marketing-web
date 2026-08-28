import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/marketing/MarketingBlocks.module.css'),
  'utf8',
);

describe('shared form-section grid treatment', () => {
  it('keeps the page-level grid fade in its established horizontal direction', () => {
    const maskRule = stylesheet.match(
      /^\.section\[data-grid='true'\]\[data-grid-fade='left-to-right'\]::before,[\s\S]*?\{([^}]*)\}/m,
    )?.[1];

    expect(maskRule).toContain(
      'linear-gradient(to right, var(--ink) 0, var(--ink) 38%, color-mix(in srgb, var(--ink) 12%, transparent) 72%, transparent 100%)',
    );
    expect(maskRule).not.toContain('linear-gradient(to bottom, transparent 0');
  });

  it('keeps separators on linked numbered rows until the final sibling', () => {
    expect(stylesheet).toContain('.numberedRowLink:last-child .numberedRow');
    expect(stylesheet).not.toMatch(/^\.numberedRow:last-child/m);
  });
});
