export type ActiveFrame = {
  deltaMs: number;
  elapsedMs: number;
  timestamp: number;
};

export type ActiveFrameLoop = {
  destroy: () => void;
  setActive: (active: boolean) => void;
};

export function createActiveFrameLoop(frame: (frame: ActiveFrame) => void): ActiveFrameLoop {
  let active = false;
  let destroyed = false;
  let elapsedMs = 0;
  let frameId = 0;
  let lastTimestamp: number | undefined;

  const tick = (timestamp: number) => {
    frameId = 0;
    if (!active || destroyed) return;
    const deltaMs = lastTimestamp === undefined ? 0 : Math.max(0, timestamp - lastTimestamp);
    elapsedMs += deltaMs;
    lastTimestamp = timestamp;
    frame({ deltaMs, elapsedMs, timestamp });
    if (active && !destroyed) frameId = requestAnimationFrame(tick);
  };

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lastTimestamp = undefined;
    },
    setActive(nextActive) {
      if (destroyed || nextActive === active) return;
      active = nextActive;
      lastTimestamp = undefined;
      if (active) {
        frameId = requestAnimationFrame(tick);
      } else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
  };
}
