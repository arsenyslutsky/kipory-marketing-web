import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/ui/SubmissionForm.module.css'),
  'utf8',
);

describe('SubmissionForm success panel treatment', () => {
  it('reserves fixed-header clearance when focus scrolls to the success panel', () => {
    const style = document.createElement('style');
    const panel = document.createElement('section');

    style.textContent = stylesheet;
    panel.className = 'panel';
    document.head.append(style);
    document.body.append(panel);

    try {
      expect(getComputedStyle(panel).scrollMarginTop).toBe('88px');
    } finally {
      panel.remove();
      style.remove();
    }
  });

  it('flips the internal panel gradient across both axes', () => {
    const panelRule = stylesheet.match(/^\.panel \{([^}]*)\}/m)?.[1];

    expect(panelRule).toContain(
      'linear-gradient(285deg, color-mix(in srgb, var(--signal) 14%, transparent), color-mix(in srgb, var(--surface-alternate) 78%, transparent) 56%)',
    );
    expect(panelRule).not.toContain('linear-gradient(105deg');
  });
});
