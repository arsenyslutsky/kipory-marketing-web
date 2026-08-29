import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createActiveFrameLoop } from './createActiveFrameLoop';

describe('createActiveFrameLoop', () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextId = 1;

  beforeEach(() => {
    callbacks.clear();
    nextId = 1;
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => callbacks.delete(id)));
  });

  afterEach(() => vi.unstubAllGlobals());

  function runFrame(timestamp: number) {
    const [id, callback] = callbacks.entries().next().value as [number, FrameRequestCallback];
    callbacks.delete(id);
    callback(timestamp);
  }

  it('preserves active elapsed time across a pause', () => {
    const frame = vi.fn();
    const loop = createActiveFrameLoop(frame);

    loop.setActive(true);
    runFrame(1000);
    runFrame(1016);
    loop.setActive(false);
    expect(callbacks).toHaveLength(0);

    loop.setActive(true);
    runFrame(5016);

    expect(frame).toHaveBeenNthCalledWith(1, { deltaMs: 0, elapsedMs: 0, timestamp: 1000 });
    expect(frame).toHaveBeenNthCalledWith(2, { deltaMs: 16, elapsedMs: 16, timestamp: 1016 });
    expect(frame).toHaveBeenNthCalledWith(3, { deltaMs: 0, elapsedMs: 16, timestamp: 5016 });
  });

  it('treats repeated activity changes as no-ops', () => {
    const loop = createActiveFrameLoop(vi.fn());

    loop.setActive(true);
    loop.setActive(true);
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    loop.setActive(false);
    loop.setActive(false);
    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  });

  it('never reschedules after destruction', () => {
    const frame = vi.fn();
    const loop = createActiveFrameLoop(frame);
    loop.setActive(true);
    loop.destroy();
    loop.setActive(true);

    expect(callbacks).toHaveLength(0);
    expect(frame).not.toHaveBeenCalled();
  });
});
