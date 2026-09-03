import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { defaultColors } from '../config';
import { createSignalFlowScene } from '../scene/createSignalFlowScene';
import { loadSignalFlowSceneFactory } from '../scene/loadSignalFlowScene';
import { BusinessFlow3D } from './BusinessFlow3D';

vi.mock('../scene/createSignalFlowScene', () => ({ createSignalFlowScene: vi.fn() }));
vi.mock('../scene/loadSignalFlowScene', () => ({ loadSignalFlowSceneFactory: vi.fn() }));

beforeEach(() => {
  vi.mocked(loadSignalFlowSceneFactory).mockResolvedValue(createSignalFlowScene);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

function createController() {
  return {
    destroy: vi.fn(),
    reroute: vi.fn(),
    setActive: vi.fn(),
    setCameraZoom: vi.fn(),
  };
}

it('inherits light scene colors from theme context', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation(createController);

  render(
    <ThemeProvider preference="light">
      <BusinessFlow3D showInterface={false} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());
  expect(vi.mocked(createSignalFlowScene).mock.calls[0]?.[0]).toMatchObject({
    connectorOpacity: 0.82,
    mode: 'light',
    nodeIconOpacity: 0.9,
    theme: defaultColors.light,
  });
});

it('falls back to dark scene colors outside theme context', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation(createController);

  render(<BusinessFlow3D showInterface={false} />);
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());
  expect(vi.mocked(createSignalFlowScene).mock.calls[0]?.[0]).toMatchObject({
    connectorOpacity: 0.92,
    mode: 'dark',
    nodeIconOpacity: 0.94,
    theme: defaultColors.dark,
  });
});

it('passes public node-shadow parameters to the renderer', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation(createController);

  render(
    <BusinessFlow3D
      nodeShadowBias={-0.001}
      nodeShadowBlurSamples={11}
      nodeShadowColor="#123456"
      nodeShadowLightX={-4}
      nodeShadowLightY={9}
      nodeShadowLightZ={3}
      nodeShadowNormalBias={0.04}
      nodeShadowOpacity={0.37}
      nodeShadowRadius={6}
      showInterface={false}
    />,
  );

  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());
  expect(vi.mocked(createSignalFlowScene).mock.calls[0]?.[0]).toMatchObject({
    nodeShadowBias: -0.001,
    nodeShadowBlurSamples: 11,
    nodeShadowColor: '#123456',
    nodeShadowLightX: -4,
    nodeShadowLightY: 9,
    nodeShadowLightZ: 3,
    nodeShadowNormalBias: 0.04,
    nodeShadowOpacity: 0.37,
    nodeShadowRadius: 6,
  });
});

it('honors an explicit dark mode over light theme context', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation(createController);

  render(
    <ThemeProvider preference="light">
      <BusinessFlow3D mode="dark" showInterface={false} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());
  expect(vi.mocked(createSignalFlowScene).mock.calls[0]?.[0]).toMatchObject({
    mode: 'dark',
    theme: defaultColors.dark,
  });
});

it('destroys and recreates the scene once when the provider theme changes', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  const lightController = createController();
  const darkController = createController();
  vi.mocked(createSignalFlowScene)
    .mockReturnValueOnce(lightController)
    .mockReturnValueOnce(darkController);

  const view = render(
    <ThemeProvider preference="light">
      <BusinessFlow3D showInterface={false} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());

  view.rerender(
    <ThemeProvider preference="dark">
      <BusinessFlow3D showInterface={false} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledTimes(2));

  expect(lightController.destroy).toHaveBeenCalledOnce();
  expect(darkController.destroy).not.toHaveBeenCalled();
  expect(vi.mocked(createSignalFlowScene).mock.calls[1]?.[0].theme).toBe(defaultColors.dark);
});

it('reports a local mode selection without mutating the provider preference', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation(createController);
  const onModeChange = vi.fn();
  const view = render(
    <ThemeProvider preference="light">
      <BusinessFlow3D onModeChange={onModeChange} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createSignalFlowScene).toHaveBeenCalledOnce());

  fireEvent.click(view.getByRole('button', { name: 'DARK' }));

  expect(onModeChange).toHaveBeenCalledWith('dark');
  expect(view.getByLabelText(/Business flow 3D/)).toHaveAttribute('data-mode', 'light');
  expect(createSignalFlowScene).toHaveBeenCalledOnce();
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

it('rejects a stale scene factory before it can replace the current CSS renderer', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  const staleController = createController();
  const currentController = createController();
  const staleFactory = vi.fn((options) => {
    const renderer = document.createElement('div');
    renderer.dataset.renderer = 'stale';
    options.elements.cssLayer.replaceChildren(renderer);
    return staleController;
  });
  const currentFactory = vi.fn((options) => {
    const renderer = document.createElement('div');
    renderer.dataset.renderer = 'current';
    options.elements.cssLayer.replaceChildren(renderer);
    return currentController;
  });
  let resolveStaleFactory!: (factory: typeof createSignalFlowScene) => void;
  let resolveCurrentFactory!: (factory: typeof createSignalFlowScene) => void;
  vi.mocked(loadSignalFlowSceneFactory)
    .mockReturnValueOnce(new Promise((resolve) => { resolveStaleFactory = resolve; }))
    .mockReturnValueOnce(new Promise((resolve) => { resolveCurrentFactory = resolve; }));

  const view = render(
    <ThemeProvider preference="light">
      <BusinessFlow3D showInterface={false} />
    </ThemeProvider>,
  );
  view.rerender(
    <ThemeProvider preference="dark">
      <BusinessFlow3D showInterface={false} />
    </ThemeProvider>,
  );
  await act(async () => {
    resolveCurrentFactory(currentFactory);
  });
  await waitFor(() => expect(currentFactory).toHaveBeenCalledOnce());
  const currentRenderer = view.container.querySelector('[data-renderer="current"]');
  expect(currentRenderer).toBeInTheDocument();

  await act(async () => {
    resolveStaleFactory(staleFactory);
  });

  expect(staleFactory).not.toHaveBeenCalled();
  expect(view.container.querySelector('[data-renderer="current"]')).toBe(currentRenderer);
  expect(staleController.destroy).not.toHaveBeenCalled();
  expect(currentController.destroy).not.toHaveBeenCalled();
});
