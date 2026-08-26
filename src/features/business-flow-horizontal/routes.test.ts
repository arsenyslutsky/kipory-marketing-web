import { expect, it } from 'vitest';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from './routes';

it('preserves twelve connectors and the off-canvas entry', () => {
  expect(businessFlowHorizontalPaths).toHaveLength(12);
  expect(businessFlowHorizontalPaths[0]).toMatchObject({
    id: 'aux-top',
    points: [
      [324 / 320, 244 / 608], [302 / 320, 244 / 608],
      [302 / 320, 282 / 608], [282 / 320, 282 / 608],
    ],
  });
  expect(businessFlowHorizontalPaths.at(-1)?.id).toBe('relay-bottom-terminal-2');
});

it('preserves staggering and scales the cycle by speed', () => {
  const source = createBusinessFlowHorizontalBeamSource(2);
  expect(source.slots).toBe(12);
  expect(source.next(0, 0)).toMatchObject({ id: 'aux-top:0', delayMs: 0, durationMs: 312 });
  expect(source.next(1, 0)?.delayMs).toBe(50);
  expect(source.next(0, 1)?.delayMs).toBe(2288);
});
