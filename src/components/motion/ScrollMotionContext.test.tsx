import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  ScrollMotionProvider,
  useScrollMotion,
  type ScrollMotionSnapshot,
} from './ScrollMotionContext';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Subscriber({ listener }: { listener: (snapshot: ScrollMotionSnapshot) => void }) {
  const scrollMotion = useScrollMotion();
  useEffect(() => scrollMotion?.subscribe(listener), [listener, scrollMotion]);
  return null;
}

it('shares one scroll frame with every subscriber and cleans up the listener', () => {
  let frame: FrameRequestCallback | undefined;
  const first = vi.fn();
  const second = vi.fn();
  const addEventListener = vi.spyOn(window, 'addEventListener');
  const removeEventListener = vi.spyOn(window, 'removeEventListener');
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 350 });
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    frame = callback;
    return 1;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  const view = render(
    <ScrollMotionProvider scrollRange={700}>
      <Subscriber listener={first} />
      <Subscriber listener={second} />
    </ScrollMotionProvider>,
  );

  expect(addEventListener.mock.calls.filter(([type]) => type === 'scroll')).toHaveLength(1);
  act(() => frame?.(1234));
  expect(first).toHaveBeenCalledWith({ progress: 0.5, timestamp: 1234 });
  expect(second).toHaveBeenCalledWith({ progress: 0.5, timestamp: 1234 });

  view.unmount();
  expect(removeEventListener.mock.calls.filter(([type]) => type === 'scroll')).toHaveLength(1);
});
