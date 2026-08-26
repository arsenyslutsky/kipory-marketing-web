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

it('does not emit a progress-zero arrival before its delay completes', () => {
  const delayedRun = {
    ...run,
    arrivals: [{ id: 'start', point: [0, 0] as const, progress: 0 }],
  };

  expect(stepFlowLayer3DBeamRun(delayedRun, 249, new Set())).toMatchObject({
    arrivals: [],
    progress: 0,
  });
  expect(stepFlowLayer3DBeamRun(delayedRun, 250, new Set())).toMatchObject({
    arrivals: [delayedRun.arrivals[0]],
    progress: 0,
  });
});

it('deduplicates repeated arrival IDs from one scheduler step', () => {
  const duplicateArrivalRun = {
    ...run,
    delayMs: 0,
    arrivals: [
      { id: 'same', point: [0.5, 0.5] as const, progress: 0.5 },
      { id: 'same', point: [0.75, 0.75] as const, progress: 0.5 },
    ],
  };

  expect(stepFlowLayer3DBeamRun(duplicateArrivalRun, 500, new Set()).arrivals).toEqual([
    duplicateArrivalRun.arrivals[0],
  ]);
});
