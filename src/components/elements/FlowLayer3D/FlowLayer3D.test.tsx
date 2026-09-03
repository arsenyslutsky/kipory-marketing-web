import { act, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { FlowLayer3D } from './FlowLayer3D';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';

vi.mock('./createFlowLayer3DScene', () => ({ createFlowLayer3DScene: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

type ObservedIntersection = {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
};

function installIntersectionObservers() {
  const observers: ObservedIntersection[] = [];
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
  return observers;
}

function emitIntersection(observer: ObservedIntersection, isIntersecting: boolean) {
  observer.callback([{
    isIntersecting,
  } as IntersectionObserverEntry], {} as IntersectionObserver);
}

const beam = {
  beamColor: '#449c40',
  beamHighlightColor: '#c9ebc7',
  beamWidth: 1,
  enabled: true,
  glowIntensity: 1,
  trailLength: 0.38,
};

const beamSource = { slots: 0, next: () => null };
const connector = { color: '#fff', opacity: 0.5, stroke: 'dashed' as const, width: 1.25 };
const emptyPaths: readonly [] = [];
const nodes = [{
  cardDepth: 40,
  height: 12,
  icon: 'server.svg',
  iconColor: '#f3f5ef',
  iconOpacity: 1,
  id: 'server',
  position: [0.2, 0.5] as const,
  shape: 'square' as const,
  tier: 2,
  width: 48,
}];
const productionFallbackNodes = [{
  ...nodes[0],
  cardDepth: 34,
  icon: 'download.svg',
  iconColor: businessFlowPalettes.dark.horizontalAuxiliaryIconFill,
  iconOpacity: 0.72,
  iconStrokeColor: businessFlowPalettes.dark.horizontalIconStroke,
  id: 'terminal-1',
  shape: 'rectangle' as const,
  width: 30,
}];
const nodeStyleWithoutMode = {
  assetBasePath: '/assets/nodes',
  frontGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  nodeCornerRadius: 12,
  outlineOpacity: 0.5,
  outlineWidth: 1,
  progressBarHeight: 8,
  progressMode: 'outline' as const,
  progressPadding: 2,
  sideXGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  sideZGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
};
const nodeStyle = { ...nodeStyleWithoutMode, mode: 'dark' as const };

it('defaults to dark mode outside a theme provider', async () => {
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn(), setActive: vi.fn() });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyleWithoutMode}
    paths={emptyPaths}
  />);

  expect(view.container.firstElementChild).toHaveAttribute('data-mode', 'dark');
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
      mode: 'dark',
      nodeStyle: expect.objectContaining({ mode: 'dark' }),
    }));
  });
});

it('inherits light mode in the scene node style from the theme provider', async () => {
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn(), setActive: vi.fn() });
  const view = render(
    <ThemeProvider preference="light">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        connector={connector}
        nodeStyle={nodeStyleWithoutMode}
        paths={emptyPaths}
      />
    </ThemeProvider>,
  );

  expect(view.container.firstElementChild).toHaveAttribute('data-mode', 'light');
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
      mode: 'light',
      nodeStyle: expect.objectContaining({ mode: 'light' }),
    }));
  });
});

it('prefers an explicit dark mode over a light theme provider', async () => {
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn(), setActive: vi.fn() });
  const view = render(
    <ThemeProvider preference="light">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        connector={connector}
        mode="dark"
        nodeStyle={nodeStyleWithoutMode}
        paths={emptyPaths}
      />
    </ThemeProvider>,
  );

  expect(view.container.firstElementChild).toHaveAttribute('data-mode', 'dark');
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
      mode: 'dark',
      nodeStyle: expect.objectContaining({ mode: 'dark' }),
    }));
  });
});

it('uses light palette defaults in the DOM fallback', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(
    <ThemeProvider preference="light">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        connector={connector}
        nodes={nodes}
        paths={emptyPaths}
      />
    </ThemeProvider>,
  );

  const fallback = await view.findByTestId('flow-layer-node-fallback');
  expect(fallback.querySelector('[data-flow-node-fallback-body]')).toHaveStyle({
    '--flow-node-body-end': businessFlowPalettes.light.frontGradient.end,
    '--flow-node-body-mid': businessFlowPalettes.light.frontGradient.mid,
    '--flow-node-body-start': businessFlowPalettes.light.frontGradient.start,
    '--flow-node-icon-color': businessFlowPalettes.light.iconStroke,
  });
});

it('destroys the previous scene before constructing a replacement for a provider mode change', async () => {
  const events: string[] = [];
  vi.mocked(createFlowLayer3DScene).mockImplementation((options) => {
    events.push(`create:${options.mode}`);
    return {
      destroy: vi.fn(() => events.push(`destroy:${options.mode}`)),
      setActive: vi.fn(),
    };
  });
  const view = render(
    <ThemeProvider preference="light">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        connector={connector}
        nodeStyle={nodeStyleWithoutMode}
        paths={emptyPaths}
      />
    </ThemeProvider>,
  );
  await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledOnce());

  view.rerender(
    <ThemeProvider preference="dark">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        connector={connector}
        nodeStyle={nodeStyleWithoutMode}
        paths={emptyPaths}
      />
    </ThemeProvider>,
  );

  await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledTimes(2));
  expect(events).toEqual(['create:light', 'destroy:light', 'create:dark']);
});

it('initializes near the viewport and pauses the scene when it leaves', async () => {
  const observers = installIntersectionObservers();
  const destroy = vi.fn();
  const setActive = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy, setActive });

  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    loadStrategy="near-viewport"
    paths={emptyPaths}
  />);

  expect(createFlowLayer3DScene).not.toHaveBeenCalled();
  expect(view.container.querySelector('canvas')).not.toBeInTheDocument();
  expect(view.container.firstElementChild).toHaveAttribute('data-flow-state', 'deferred');
  const preloadObserver = observers.find(({ options }) => options?.rootMargin === '600px 0px');
  const viewportObserver = observers.find(({ options }) => !options?.rootMargin);
  if (!preloadObserver || !viewportObserver) throw new Error('Expected preload and viewport observers.');

  act(() => emitIntersection(preloadObserver, true));
  await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledOnce());
  expect(view.container.querySelector('canvas')).toBeInTheDocument();

  act(() => emitIntersection(viewportObserver, true));
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith(true));

  act(() => emitIntersection(viewportObserver, false));
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith(false));

  view.unmount();
  expect(destroy).toHaveBeenCalledOnce();
});

it('creates one scene and destroys it on unmount', async () => {
  const destroy = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy, setActive: vi.fn() });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={[{ id: 'a', points: [[0, 0], [1, 1]] }]}
  />);

  await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledTimes(1));
  expect(view.container.firstElementChild).toHaveAttribute('aria-hidden', 'true');

  view.unmount();

  expect(destroy).toHaveBeenCalledTimes(1);
});

it('keeps the flow loading until the scene reports its first completed frame', async () => {
  let reportReady: (() => void) | undefined;
  vi.mocked(createFlowLayer3DScene).mockImplementation((options) => {
    reportReady = options.onReady;
    return { destroy: vi.fn(), setActive: vi.fn() };
  });

  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);
  const root = view.container.firstElementChild;

  expect(root).toHaveAttribute('data-flow-state', 'loading');
  expect(view.getByTestId('flow-loader')).toBeInTheDocument();

  await waitFor(() => expect(reportReady).toBeTypeOf('function'));
  act(() => reportReady?.());

  expect(root).toHaveAttribute('data-flow-state', 'ready');
});

it('mounts one shared CSS3D layer and passes serializable nodes to the scene', async () => {
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn(), setActive: vi.fn() });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  expect(view.container.querySelectorAll('canvas')).toHaveLength(1);
  expect(view.container.querySelectorAll('[data-flow-layer-css3d]')).toHaveLength(1);
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenCalledWith(expect.objectContaining({
      cssLayer: expect.any(HTMLElement),
      nodes: [expect.objectContaining({ id: 'server' })],
    }));
  });
});

it('does not recreate an omitted-node scene for an unchanged rerender', async () => {
  const destroy = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy, setActive: vi.fn() });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledOnce());
  view.rerender(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  expect(createFlowLayer3DScene).toHaveBeenCalledOnce();
  expect(destroy).not.toHaveBeenCalled();
});

it('does not retry a failed omitted-node scene when error state renders', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  await view.findByTestId('flow-layer-node-fallback');
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenCalledOnce();
  });
  expect(diagnostic).toHaveBeenCalledOnce();
});

it('activates the fallback when the scene reports a post-mount rebuild failure', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  let reportSceneError: ((error: unknown) => void) | undefined;
  vi.mocked(createFlowLayer3DScene).mockImplementation((options) => {
    reportSceneError = options.onError;
    return { destroy: vi.fn(), setActive: vi.fn() };
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={productionFallbackNodes}
    paths={[]}
  />);

  expect(view.queryByTestId('flow-layer-node-fallback')).not.toBeInTheDocument();
  await waitFor(() => expect(reportSceneError).toBeTypeOf('function'));

  act(() => {
    reportSceneError?.(new Error('resize node rebuild failed'));
  });

  expect(await view.findByTestId('flow-layer-node-fallback')).toBeInTheDocument();
  expect(view.container.firstElementChild).toHaveAttribute('data-flow-state', 'error');
  expect(view.getByTestId('flow-loader')).toHaveAttribute('data-active', 'false');
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({
    message: 'resize node rebuild failed',
  }));
});

it('renders CSS-pixel node fallbacks after a WebGL failure and clears them after recovery', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  expect(view.container.firstElementChild).toBeInTheDocument();
  const fallback = await view.findByTestId('flow-layer-node-fallback');
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({ message: 'WebGL unavailable' }));
  const fallbackNode = fallback.querySelector('span');
  expect(fallbackNode).toHaveStyle({
    '--flow-node-height': '40px',
    '--flow-node-width': '48px',
    '--flow-node-x': '20%',
    '--flow-node-y': '50%',
  });

  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn(), setActive: vi.fn() });
  view.rerender(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  await waitFor(() => {
    expect(view.queryByTestId('flow-layer-node-fallback')).not.toBeInTheDocument();
  });
});

it('renders a visible fallback body and a separate contrasting icon with production colors', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={productionFallbackNodes}
    paths={[]}
  />);

  const fallback = await view.findByTestId('flow-layer-node-fallback');
  const body = fallback.querySelector<HTMLElement>('[data-flow-node-fallback-body]');
  const icon = fallback.querySelector<HTMLElement>('[data-flow-node-fallback-icon]');

  expect(body).toBeInTheDocument();
  expect(body).toHaveAttribute('data-flow-node-shape', 'rectangle');
  expect(body).toHaveStyle({
    '--flow-node-body-end': '#111',
    '--flow-node-body-mid': '#222',
    '--flow-node-body-start': '#333',
    '--flow-node-icon-color': businessFlowPalettes.dark.horizontalIconStroke,
  });
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveStyle({
    '--flow-node-icon': 'url("/assets/nodes/download.svg")',
  });
});
