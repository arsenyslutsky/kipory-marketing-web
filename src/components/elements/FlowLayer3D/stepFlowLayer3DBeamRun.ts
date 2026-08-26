import type { FlowLayer3DBeamRun } from './types';

export function stepFlowLayer3DBeamRun(
  run: FlowLayer3DBeamRun,
  elapsedMs: number,
  deliveredArrivalIds: ReadonlySet<string>,
) {
  const travelMs = Math.max(0, elapsedMs - Math.max(0, run.delayMs));
  const durationMs = Math.max(1, run.durationMs);
  const progress = Math.min(1, travelMs / durationMs);

  return {
    arrivals: (run.arrivals ?? []).filter((arrival) => (
      arrival.progress <= progress && !deliveredArrivalIds.has(arrival.id)
    )),
    completed: travelMs >= durationMs,
    progress,
  };
}
