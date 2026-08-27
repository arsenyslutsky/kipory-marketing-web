import type { FlowLayer3DBeamRun } from './types';

const timingEpsilonMs = 0.000001;

function smoothstep(value: number) {
  const resolved = Math.min(1, Math.max(0, value));
  return resolved * resolved * (3 - 2 * resolved);
}

function resolveVisibility(run: FlowLayer3DBeamRun, progress: number) {
  const startUntilProgress = Math.min(1, Math.max(0, run.fade?.startUntilProgress ?? 0));
  const endFromProgress = Math.min(1, Math.max(0, run.fade?.endFromProgress ?? 1));
  const startVisibility = startUntilProgress > 0
    ? smoothstep(progress / startUntilProgress)
    : 1;
  const endVisibility = endFromProgress < 1
    ? smoothstep((1 - progress) / (1 - endFromProgress))
    : 1;
  return startVisibility * endVisibility;
}

export function stepFlowLayer3DBeamRun(
  run: FlowLayer3DBeamRun,
  elapsedMs: number,
  deliveredArrivalIds: ReadonlySet<string>,
) {
  const delayMs = Math.max(0, run.delayMs);
  const started = elapsedMs >= delayMs - timingEpsilonMs;
  const travelMs = Math.max(0, elapsedMs - delayMs);
  const durationMs = Math.max(1, run.durationMs);
  const completed = travelMs >= durationMs - timingEpsilonMs;
  const progress = completed ? 1 : Math.min(1, travelMs / durationMs);
  const arrivalIds = new Set(deliveredArrivalIds);

  return {
    arrivals: started
      ? (run.arrivals ?? []).filter((arrival) => {
        if (arrival.progress > progress || arrivalIds.has(arrival.id)) return false;
        arrivalIds.add(arrival.id);
        return true;
      })
      : [],
    completed,
    endElapsedMs: delayMs + durationMs,
    progress,
    started,
    visibility: resolveVisibility(run, progress),
  };
}
