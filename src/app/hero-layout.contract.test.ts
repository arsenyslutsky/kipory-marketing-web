import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/app/marketing.module.css'),
  'utf8',
);

it('uses deterministic desktop hero spacing while preserving compact breakpoints', () => {
  const desktopRule = stylesheet.match(/^\.heroCopy \{([^}]*)\}/m)?.[1];
  const tabletBlock = stylesheet.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/)?.[1];
  const mobileBlock = stylesheet.match(/@media \(max-width: 620px\) \{([\s\S]*?)\n\}/)?.[1];

  expect(desktopRule).toContain('padding: 130px 0 10px;');
  expect(tabletBlock).toContain('.heroCopy { width: min(700px, 86vw); padding: 12.5svh 0 32px; }');
  expect(mobileBlock).toContain('.heroCopy { width: 100%; padding: 104px 0 32px; transform: none; }');
});

it('adds protocol breathing room only to the wide homepage hero', () => {
  const protocolRule = stylesheet.match(/^\.heroProtocolsList \{([^}]*)\}/m)?.[1];
  const tabletBlock = stylesheet.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/)?.[1];

  expect(protocolRule).toContain('padding: 70px 0 18px;');
  expect(tabletBlock).toContain('.heroProtocolsList { padding: 0; }');
});

it('keeps the hero learn-more rhythm deterministic across breakpoints', () => {
  const learnMoreRule = stylesheet.match(/^\.heroLearnMore \{([^}]*)\}/m)?.[1];
  const mobileBlock = stylesheet.match(/@media \(max-width: 620px\) \{([\s\S]*?)\n\}/)?.[1];

  expect(learnMoreRule).toContain('margin: 30px 0 0;');
  expect(learnMoreRule).toContain('padding-top: 15px;');
  expect(mobileBlock).toContain('.heroLearnMore { margin-top: 22px;');
});

it('matches the desktop link-to-divider gaps while retaining mobile Pillars space', () => {
  const tabletBlock = stylesheet.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/)?.[1];

  expect(tabletBlock).toContain('.main .movementSection { padding-bottom: 35px; }');
});
