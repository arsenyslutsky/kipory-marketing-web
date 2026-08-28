import type { FlowLayer3DBeamRun } from './types';

function normalizeDelay(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

export function addNodeProcessingDelays(
  run: FlowLayer3DBeamRun,
  minDelay: number,
  maxDelay: number,
  random: () => number = Math.random,
): FlowLayer3DBeamRun {
  const first = normalizeDelay(minDelay);
  const second = normalizeDelay(maxDelay);
  const minimum = Math.min(first, second);
  const maximum = Math.max(first, second);
  if (maximum === 0 || !run.arrivals?.length) return run;

  return {
    ...run,
    arrivals: run.arrivals.map((arrival) => {
      const randomValue = random();
      const randomUnit = Number.isFinite(randomValue)
        ? Math.min(1, Math.max(0, randomValue))
        : 0;
      return {
        ...arrival,
        processingDelayMs: minimum + Math.round(randomUnit * (maximum - minimum)),
      };
    }),
  };
}
