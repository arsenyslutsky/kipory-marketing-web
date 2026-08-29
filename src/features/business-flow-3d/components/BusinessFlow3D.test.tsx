import { act, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createSignalFlowScene } from '../scene/createSignalFlowScene';
import { BusinessFlow3D } from './BusinessFlow3D';

vi.mock('../scene/createSignalFlowScene', () => ({ createSignalFlowScene: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it('reveals the hero flow only after its first completed scene frame', async () => {
  let reportReady: (() => void) | undefined;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation((options) => {
    reportReady = options.onReady;
    return {
      destroy: vi.fn(),
      reroute: vi.fn(),
      setActive: vi.fn(),
      setCameraZoom: vi.fn(),
    };
  });

  const view = render(<BusinessFlow3D showInterface={false} />);
  const flow = view.getByLabelText(/Business flow 3D/);

  expect(flow).toHaveAttribute('data-flow-state', 'loading');
  expect(view.getByTestId('flow-loader')).toBeInTheDocument();

  await waitFor(() => expect(reportReady).toBeTypeOf('function'));
  act(() => reportReady?.());

  expect(flow).toHaveAttribute('data-flow-state', 'ready');
});

it('defers construction until preload and pauses the scene outside the viewport', async () => {
  const observers: Array<{
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
  }> = [];
  vi.stubGlobal('IntersectionObserver', class {
    readonly root = null;
    readonly rootMargin: string;
    readonly thresholds = [0];
    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      observers.push({ callback, options });
      this.rootMargin = options?.rootMargin ?? '0px';
    }
  });
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  const setActive = vi.fn();
  vi.mocked(createSignalFlowScene).mockReturnValue({
    destroy: vi.fn(),
    reroute: vi.fn(),
    setActive,
    setCameraZoom: vi.fn(),
  });

  render(<BusinessFlow3D loadStrategy="near-viewport" showInterface={false} />);
  expect(createSignalFlowScene).not.toHaveBeenCalled();

  const preload = observers.find(({ options }) => options?.rootMargin === '600px 0px');
  const viewport = observers.find(({ options }) => !options?.rootMargin);
  if (!preload || !viewport) throw new Error('Expected preload and viewport observers.');
  act(() => preload.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());

  act(() => viewport.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith(true));
  act(() => viewport.callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith(false));
});
