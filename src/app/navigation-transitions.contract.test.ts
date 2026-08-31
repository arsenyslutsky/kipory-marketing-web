import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const globalCss = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

function declarationBlock(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return globalCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

it('fades through black in exactly 500ms without spatial motion', () => {
  const exit = declarationBlock('::view-transition-old(.route-exit)');
  const enter = declarationBlock('::view-transition-new(.route-enter)');
  const fadeOut = globalCss.match(/@keyframes routeFadeOut\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const fadeIn = globalCss.match(/@keyframes routeFadeIn\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  expect(exit).toMatch(/animation:\s*routeFadeOut 180ms/);
  expect(enter).toMatch(/animation:\s*routeFadeIn 320ms[\s\S]*180ms/);
  expect(`${fadeOut}\n${fadeIn}`).not.toMatch(/translate|transform|filter/);
});

it('makes the fade effectively instant for reduced motion', () => {
  const reduced = globalCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  expect(reduced).toMatch(/animation-duration:\s*\.01ms !important/);
  expect(reduced).toMatch(/animation-delay:\s*0ms !important/);
});
