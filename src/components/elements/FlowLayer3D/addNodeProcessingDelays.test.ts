import { expect, it } from 'vitest';
import { addNodeProcessingDelays } from './addNodeProcessingDelays';

const run = {
  arrivals: [{ id: 'target', point: [0.5, 0.5] as const, progress: 0.5 }],
  delayMs: 0,
  durationMs: 1000,
  id: 'run',
  path: { id: 'path', points: [[0, 0], [1, 1]] as const },
};

it.each([
  { expected: 500, label: 'fixed', max: 500, min: 500, random: 0.75 },
  { expected: 1250, label: 'reversed', max: 500, min: 1500, random: 0.75 },
  { expected: 0, label: 'negative', max: -100, min: -500, random: 0.5 },
  { expected: 0, label: 'non-finite', max: Number.POSITIVE_INFINITY, min: Number.NaN, random: 0.5 },
])('normalizes $label delay bounds without creating non-finite timing', ({ expected, max, min, random }) => {
  const delayed = addNodeProcessingDelays(run, min, max, () => random);
  const delay = delayed.arrivals?.[0]?.processingDelayMs ?? 0;

  expect(delay).toBe(expected);
  expect(Number.isFinite(delay)).toBe(true);
});
