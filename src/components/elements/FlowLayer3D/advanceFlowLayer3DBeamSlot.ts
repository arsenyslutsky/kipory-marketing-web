import type { FlowLayer3DBeamRun, FlowLayer3DBeamSource } from './types';

export type FlowLayer3DBeamSlotAdvance = {
  generation: number;
  run: FlowLayer3DBeamRun | null;
  status: 'ready' | 'invalid' | 'exhausted';
};

export function advanceFlowLayer3DBeamSlot(
  source: FlowLayer3DBeamSource,
  slot: number,
  generation: number,
  isValidRun: (run: FlowLayer3DBeamRun) => boolean,
): FlowLayer3DBeamSlotAdvance {
  const run = source.next(slot, generation);
  if (!run) return { generation, run: null, status: 'exhausted' };
  if (!isValidRun(run)) return { generation, run: null, status: 'invalid' };
  return { generation, run, status: 'ready' };
}
