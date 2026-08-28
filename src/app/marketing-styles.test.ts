import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(resolve(process.cwd(), 'src/app/marketing.module.css'), 'utf8');

describe('shared form-section grid treatment', () => {
  it('keeps the page-level grid fade in its established horizontal direction', () => {
    const maskRule = stylesheet.match(/^\.waitlistFormSection::before \{([^}]*)\}/m)?.[1];

    expect(maskRule).toContain(
      'linear-gradient(to right, #000 0, #000 38%, rgba(0,0,0,.12) 72%, transparent 100%)',
    );
    expect(maskRule).not.toContain('linear-gradient(to bottom, transparent 0');
  });
});
