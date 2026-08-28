import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/ui/SubmissionForm.module.css'),
  'utf8',
);

describe('SubmissionForm success panel treatment', () => {
  it('flips the internal panel gradient across both axes', () => {
    const panelRule = stylesheet.match(/^\.panel \{([^}]*)\}/m)?.[1];

    expect(panelRule).toContain(
      'linear-gradient(285deg, rgba(57, 184, 61, .14), rgba(10, 21, 9, .78) 56%)',
    );
    expect(panelRule).not.toContain('linear-gradient(105deg');
  });
});
