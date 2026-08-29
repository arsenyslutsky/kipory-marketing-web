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
  const activeElapsedMs = Math.max(0, elapsedMs - delayMs);
  const durationMs = Math.max(1, run.durationMs);
  const seenArrivalIds = new Set<string>();
  let accumulatedProcessingDelayMs = 0;
  const processingStops = [...(run.arrivals ?? [])]
    .sort((left, right) => left.progress - right.progress)
    .flatMap((arrival) => {
      if (seenArrivalIds.has(arrival.id)) return [];
      seenArrivalIds.add(arrival.id);
      const processingDelayMs = Math.max(0, arrival.processingDelayMs ?? 0);
      const startElapsedMs = Math.min(1, Math.max(0, arrival.progress)) * durationMs
        + accumulatedProcessingDelayMs;
      accumulatedProcessingDelayMs += processingDelayMs;
      return [{ arrival, processingDelayMs, startElapsedMs }];
    });
  const activeStop = processingStops.find(({ processingDelayMs, startElapsedMs }) => (
    started
    && processingDelayMs > 0
    && activeElapsedMs >= startElapsedMs - timingEpsilonMs
    && activeElapsedMs < startElapsedMs + processingDelayMs - timingEpsilonMs
  ));
  const completedProcessingDelayMs = processingStops.reduce((total, stop) => (
    activeElapsedMs >= stop.startElapsedMs + stop.processingDelayMs - timingEpsilonMs
      ? total + stop.processingDelayMs
      : total
  ), 0);
  const effectiveTravelMs = Math.max(0, activeElapsedMs - completedProcessingDelayMs);
  const totalDurationMs = durationMs + accumulatedProcessingDelayMs;
  const completed = activeElapsedMs >= totalDurationMs - timingEpsilonMs;
  const progress = completed
    ? 1
    : activeStop
      ? Math.min(1, Math.max(0, activeStop.arrival.progress))
      : Math.min(1, effectiveTravelMs / durationMs);
  const arrivalIds = new Set(deliveredArrivalIds);

  return {
    arrivals: started
      ? processingStops.flatMap(({ arrival, startElapsedMs }) => {
        if (activeElapsedMs < startElapsedMs - timingEpsilonMs || arrivalIds.has(arrival.id)) {
          return [];
        }
        arrivalIds.add(arrival.id);
        return [arrival];
      })
      : [],
    completedProcessingIds: processingStops.flatMap(({ arrival, processingDelayMs, startElapsedMs }) => (
      started
      && processingDelayMs > 0
      && activeElapsedMs >= startElapsedMs + processingDelayMs - timingEpsilonMs
        ? [arrival.id]
        : []
    )),
    activeProcessing: activeStop ? {
      id: activeStop.arrival.id,
      progress: Math.min(1, Math.max(
        0,
        (activeElapsedMs - activeStop.startElapsedMs) / activeStop.processingDelayMs,
      )),
    } : undefined,
    completed,
    endElapsedMs: delayMs + totalDurationMs,
    progress,
    started,
    visibility: resolveVisibility(run, progress),
  };
}
