import { expect, it } from 'vitest';
import { stepFlowLayer3DBeamRun } from './stepFlowLayer3DBeamRun';

const run = {
  id: 'run-a',
  delayMs: 250,
  durationMs: 1000,
  path: { id: 'path-a', points: [[0, 0], [1, 1]] as const },
  arrivals: [
    { id: 'middle', point: [0.5, 0.5] as const, progress: 0.5 },
    { id: 'end', point: [1, 1] as const, progress: 1 },
  ],
};

it('waits for delay and emits each crossed arrival once', () => {
  expect(stepFlowLayer3DBeamRun(run, 200, new Set())).toMatchObject({
    completed: false, progress: 0, arrivals: [],
  });
  expect(stepFlowLayer3DBeamRun(run, 750, new Set())).toMatchObject({
    completed: false, progress: 0.5, arrivals: [run.arrivals[0]],
  });
  expect(stepFlowLayer3DBeamRun(run, 900, new Set(['middle']))).toMatchObject({
    arrivals: [],
  });
  expect(stepFlowLayer3DBeamRun(run, 1250, new Set(['middle']))).toMatchObject({
    completed: true, progress: 1, arrivals: [run.arrivals[1]],
  });
});
