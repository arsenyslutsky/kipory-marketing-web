import type { FlowLayer3DBeamRun } from './types';

export function stepFlowLayer3DBeamRun(
  run: FlowLayer3DBeamRun,
  elapsedMs: number,
  deliveredArrivalIds: ReadonlySet<string>,
) {
  const delayMs = Math.max(0, run.delayMs);
  const travelMs = Math.max(0, elapsedMs - delayMs);
  const durationMs = Math.max(1, run.durationMs);
  const progress = Math.min(1, travelMs / durationMs);
  const arrivalIds = new Set(deliveredArrivalIds);

  return {
    arrivals: elapsedMs >= delayMs
      ? (run.arrivals ?? []).filter((arrival) => {
        if (arrival.progress > progress || arrivalIds.has(arrival.id)) return false;
        arrivalIds.add(arrival.id);
        return true;
      })
      : [],
    completed: travelMs >= durationMs,
    progress,
  };
}
