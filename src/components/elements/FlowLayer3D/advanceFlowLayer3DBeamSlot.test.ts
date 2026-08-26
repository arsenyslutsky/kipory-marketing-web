import { expect, it } from 'vitest';
import { advanceFlowLayer3DBeamSlot } from './advanceFlowLayer3DBeamSlot';
import { resolveFlowLayer3DPath } from './resolveFlowLayer3D';
import type { FlowLayer3DBeamRun } from './types';

const invalidRun: FlowLayer3DBeamRun = {
  delayMs: 0,
  durationMs: 100,
  id: 'invalid',
  path: { id: 'invalid-path', points: [[0.5, 0.5], [0.5, 0.5]] },
};

const validRun: FlowLayer3DBeamRun = {
  delayMs: 0,
  durationMs: 100,
  id: 'valid',
  path: { id: 'valid-path', points: [[0, 0.5], [1, 0.5]] },
};

function isValidRun(run: FlowLayer3DBeamRun) {
  return resolveFlowLayer3DPath(run.path, { aspectRatio: 1, worldHeight: 20 }) !== null;
}

it('marks an invalid initial run for one next-frame generation advance', () => {
  const generations: number[] = [];
  const source = {
    slots: 1,
    next: (_slot: number, generation: number) => {
      generations.push(generation);
      return generation === 0 ? invalidRun : validRun;
    },
  };

  const initial = advanceFlowLayer3DBeamSlot(source, 0, 0, isValidRun);

  expect(initial).toMatchObject({ generation: 0, run: null, status: 'invalid' });
  expect(generations).toEqual([0]);

  const nextFrame = advanceFlowLayer3DBeamSlot(source, 0, initial.generation + 1, isValidRun);

  expect(nextFrame).toMatchObject({ generation: 1, run: validRun, status: 'ready' });
  expect(generations).toEqual([0, 1]);
});

it('skips a later invalid run with one generation advance per frame', () => {
  const generations: number[] = [];
  const source = {
    slots: 1,
    next: (_slot: number, generation: number) => {
      generations.push(generation);
      return [validRun, invalidRun, validRun][generation] ?? null;
    },
  };

  const first = advanceFlowLayer3DBeamSlot(source, 0, 0, isValidRun);
  const laterInvalid = advanceFlowLayer3DBeamSlot(source, 0, first.generation + 1, isValidRun);

  expect(first).toMatchObject({ generation: 0, run: validRun, status: 'ready' });
  expect(laterInvalid).toMatchObject({ generation: 1, run: null, status: 'invalid' });
  expect(generations).toEqual([0, 1]);

  const afterInvalidFrame = advanceFlowLayer3DBeamSlot(
    source,
    0,
    laterInvalid.generation + 1,
    isValidRun,
  );

  expect(afterInvalidFrame).toMatchObject({ generation: 2, run: validRun, status: 'ready' });
  expect(generations).toEqual([0, 1, 2]);
});
