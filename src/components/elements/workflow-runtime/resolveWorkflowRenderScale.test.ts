import { describe, expect, it, vi } from 'vitest';
import { resolveWorkflowRenderScale } from './resolveWorkflowRenderScale';

function elementWithSize(
  layout: { height: number; width: number },
  display: { height: number; width: number },
) {
  const element = document.createElement('div');
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: layout.height },
    clientWidth: { configurable: true, value: layout.width },
  });
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    bottom: display.height,
    height: display.height,
    left: 0,
    right: display.width,
    top: 0,
    width: display.width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return element;
}

describe('resolveWorkflowRenderScale', () => {
  it('matches a CSS-scaled display box without changing scene layout size', () => {
    const element = elementWithSize(
      { height: 1429, width: 1920 },
      { height: 1000, width: 1344 },
    );

    expect(resolveWorkflowRenderScale(element, 'display')).toBeCloseTo(0.7, 3);
  });

  it('does not upscale rotated or oversized display bounds', () => {
    const element = elementWithSize(
      { height: 720, width: 1280 },
      { height: 900, width: 1400 },
    );

    expect(resolveWorkflowRenderScale(element, 'display')).toBe(1);
  });

  it('clamps explicit scales to the supported range', () => {
    const element = elementWithSize({ height: 1, width: 1 }, { height: 1, width: 1 });

    expect(resolveWorkflowRenderScale(element, 0.2)).toBe(0.5);
    expect(resolveWorkflowRenderScale(element, 0.8)).toBe(0.8);
    expect(resolveWorkflowRenderScale(element, 2)).toBe(1);
  });
});
