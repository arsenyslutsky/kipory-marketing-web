import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  capabilities: { getMaxAnisotropy: vi.fn(() => 1) },
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { autoUpdate: true, enabled: false, needsUpdate: false, type: undefined },
  toneMapping: undefined,
  toneMappingExposure: 1,
}));

const cssRenderer = vi.hoisted(() => ({
  domElement: document.createElement('div'),
  render: vi.fn(),
  setSize: vi.fn(),
}));

const flowPathCaptures = vi.hoisted(() => ({
  beam: [] as number[][],
  beamPoints: [] as Array<Array<{ x: number; y: number; z: number }>>,
  connector: [] as number[][],
  connectorPoints: [] as Array<Array<{ x: number; y: number; z: number }>>,
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: vi.fn(function MockWebGLRenderer() {
      return renderer;
    }),
  };
});

vi.mock('three/addons/renderers/CSS3DRenderer.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three/addons/renderers/CSS3DRenderer.js')>();
  return {
    ...actual,
    CSS3DRenderer: vi.fn(function MockCSS3DRenderer() {
      return cssRenderer;
    }),
  };
});

vi.mock('@/components/elements/Connector3D/createConnector3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/elements/Connector3D/createConnector3DObject')>();
  return {
    ...actual,
    createConnector3DObject: (options: Parameters<typeof actual.createConnector3DObject>[0]) => {
      flowPathCaptures.connector.push(options.path.points.map((point) => point.y));
      flowPathCaptures.connectorPoints.push(options.path.points.map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
      })));
      return actual.createConnector3DObject(options);
    },
    createFadingConnector3DObject: (options: Parameters<typeof actual.createFadingConnector3DObject>[0]) => {
      flowPathCaptures.connector.push(options.path.points.map((point) => point.y));
      flowPathCaptures.connectorPoints.push(options.path.points.map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
      })));
      return actual.createFadingConnector3DObject(options);
    },
  };
});

vi.mock('@/components/elements/Beam3D/createBeam3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/elements/Beam3D/createBeam3DObject')>();
  return {
    ...actual,
    createBeam3DObject: (options: Parameters<typeof actual.createBeam3DObject>[0]) => {
      const beam = actual.createBeam3DObject(options);
      const setPath = beam.setPath;
      beam.setPath = (path) => {
        flowPathCaptures.beam.push(path.points.map((point) => point.y));
        flowPathCaptures.beamPoints.push(path.points.map((point) => ({
          x: point.x,
          y: point.y,
          z: point.z,
        })));
        setPath(path);
      };
      return beam;
    },
  };
});

import * as THREE from 'three';
import { defaultColors } from '../config';
import { createSignalFlowScene } from './createSignalFlowScene';
import { getNode3DGradientTexture } from '@/components/elements/Node3D/node3DGradientTextureCache';

afterEach(() => {
  flowPathCaptures.beam.length = 0;
  flowPathCaptures.beamPoints.length = 0;
  flowPathCaptures.connector.length = 0;
  flowPathCaptures.connectorPoints.length = 0;
  renderer.shadowMap.autoUpdate = true;
  renderer.shadowMap.needsUpdate = false;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  { connectorElevation: 0, nodeScale: 1, safeConnectorHeights: [0.11, 0.258, 0.288] },
  { connectorElevation: 1.5, nodeScale: 1, safeConnectorHeights: [0.258, 0.288] },
  { connectorElevation: 1.5, nodeScale: 3, safeConnectorHeights: [0.038, 0.068] },
])('keeps connector paths and travelling beams below $nodeScale× node bodies', ({
  connectorElevation,
  nodeScale,
  safeConnectorHeights,
}) => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    connectorElevation,
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale,
    showContinuationConnectors: true,
  });

  animationFrames.shift()?.(1000);

  expect(flowPathCaptures.connector.length).toBeGreaterThan(0);
  expect(flowPathCaptures.beam.length).toBeGreaterThan(0);
  // Each allowed height reserves 0.012 for floating motion and 0.02 for depth separation.
  [...flowPathCaptures.connector.flat(), ...flowPathCaptures.beam.flat()].forEach((height) => {
    expect(safeConnectorHeights.some((safeHeight) => (
      Math.abs(height - safeHeight) < 0.000001
    ))).toBe(true);
  });
  safeConnectorHeights.forEach((safeHeight) => {
    expect(flowPathCaptures.beam.flat().some((height) => (
      Math.abs(height - safeHeight) < 0.000001
    ))).toBe(true);
  });
  controller.destroy();
});

it('attaches connector endpoints to each node underside while the middle span stays below every node', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const options = createSceneOptions();
  const flow = {
    ...options.flow,
    nodes: options.flow.nodes.map((node) => (
      node.id === 'leaf' ? { ...node, position: [1.2, 3] as [number, number] } : node
    )),
  };
  const controller = createSignalFlowScene({
    ...options,
    flow,
    connectorElevation: 0,
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale: 1,
  });

  expect(flowPathCaptures.connectorPoints).toHaveLength(1);
  const connector = flowPathCaptures.connectorPoints[0]!;
  expect(connector[0]!.y).toBeCloseTo(0.258, 6);
  expect(connector[1]!.y).toBeCloseTo(0.11, 6);
  expect(connector[2]!.y).toBeCloseTo(0.11, 6);
  expect(connector[3]!.y).toBeCloseTo(0.288, 6);
  controller.destroy();
});

it('tucks connector endpoints beneath scaled node faces instead of stopping at the silhouette edge', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale: 0.5,
  });

  expect(flowPathCaptures.connectorPoints).toHaveLength(1);
  const connector = flowPathCaptures.connectorPoints[0]!;
  expect(connector.map(({ x }) => x)).toEqual([0, 0]);
  expect(connector[0]!.z).toBeCloseTo(0.23, 6);
  expect(connector[1]!.z).toBeCloseTo(2.77, 6);
  controller.destroy();
});

it('keeps offset connectors orthogonal instead of drawing a diagonal shortcut', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const options = createSceneOptions();
  const flow = {
    ...options.flow,
    nodes: options.flow.nodes.map((node) => (
      node.id === 'leaf' ? { ...node, position: [0.6, 3] as [number, number] } : node
    )),
  };
  const controller = createSignalFlowScene({
    ...options,
    flow,
    connectorOpacity: 1,
    connectorWidth: 2,
  });

  expect(flowPathCaptures.connectorPoints).toHaveLength(1);
  expect(flowPathCaptures.connectorPoints[0]?.map(({ x }) => x)).toEqual([0, 0, 0.6, 0.6]);
  controller.destroy();
});

it('preserves authored parent-child columns when scaled nodes already fit without overlap', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const options = createSceneOptions();
  const flow = {
    root: 'source',
    nodes: [
      { ...options.flow.nodes[0], id: 'left-source', position: [0, 0] as [number, number] },
      { ...options.flow.nodes[0], id: 'source', position: [3, 0] as [number, number] },
      { ...options.flow.nodes[0], id: 'right-source', position: [6, 0] as [number, number] },
      { ...options.flow.nodes[1], id: 'left-target', position: [0, 3] as [number, number], shape: 'triangle' as const },
      { ...options.flow.nodes[1], id: 'target', position: [3, 3] as [number, number] },
      { ...options.flow.nodes[1], id: 'right-target', position: [6, 3] as [number, number] },
    ],
    branches: { source: ['target'] },
  };
  const controller = createSignalFlowScene({
    ...options,
    flow,
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale: 0.7,
    nodeShape: 'custom',
  });

  expect(flowPathCaptures.connectorPoints).toHaveLength(1);
  expect(flowPathCaptures.connectorPoints[0]?.map(({ x }) => x)).toEqual([3, 3]);
  controller.destroy();
});

it('keeps the orthogonal midpoint for meaningful branch offsets', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const options = createSceneOptions();
  const flow = {
    ...options.flow,
    nodes: options.flow.nodes.map((node) => (
      node.id === 'leaf' ? { ...node, position: [1.2, 3] as [number, number] } : node
    )),
  };
  const controller = createSignalFlowScene({
    ...options,
    flow,
    connectorOpacity: 1,
    connectorWidth: 2,
  });

  expect(flowPathCaptures.connectorPoints).toHaveLength(1);
  expect(flowPathCaptures.connectorPoints[0]?.map(({ x }) => x)).toEqual([0, 0, 1.2, 1.2]);
  controller.destroy();
});

it('joins incoming and terminal continuations at scaled node perimeter edges', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale: 0.5,
    showContinuationConnectors: true,
  });
  const continuations = flowPathCaptures.connectorPoints.filter((points) => (
    points.some(({ z }) => z < 0 || z > 3)
  ));

  expect(continuations).toHaveLength(2);
  expect(continuations[0]?.at(-1)?.z).toBeCloseTo(-0.23, 6);
  expect(continuations[1]?.at(0)?.z).toBeCloseTo(3.23, 6);
  controller.destroy();
});

it('ends a beam inside an early leaf that has no outgoing continuation', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(Math, 'random').mockReturnValue(0);

  const options = createSceneOptions();
  const flow = {
    root: 'root',
    nodes: [
      { ...options.flow.nodes[0], id: 'root', position: [0, 0] as [number, number], tier: 0 },
      { ...options.flow.nodes[1], id: 'early-leaf', position: [-1.5, 3] as [number, number], tier: 1 },
      { ...options.flow.nodes[1], id: 'branch', position: [1.5, 3] as [number, number], tier: 1 },
      { ...options.flow.nodes[1], id: 'terminal', position: [1.5, 6] as [number, number], tier: 2 },
    ],
    branches: {
      root: ['early-leaf', 'branch'],
      branch: ['terminal'],
    },
  };
  const controller = createSignalFlowScene({
    ...options,
    flow,
    connectorOpacity: 1,
    connectorWidth: 2,
    showContinuationConnectors: true,
  });

  animationFrames.shift()?.(1000);

  expect(flowPathCaptures.beamPoints).toHaveLength(1);
  expect(flowPathCaptures.beamPoints[0]?.at(-1)?.z).toBe(3);
  controller.destroy();
});

it.each([false, true])('connects same-row nodes at their sides and keeps beams on that route (reverse: %s)', (reverse) => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const options = createSceneOptions();
  const controller = createSignalFlowScene({
    ...options,
    connectorOpacity: 1,
    connectorWidth: 2,
    flow: {
      ...options.flow,
      nodes: options.flow.nodes.map((node) => ({
        ...node,
        position: [node.id === 'root' ? 0 : reverse ? -3 : 3, 0],
      })),
    },
  });
  animationFrames.shift()?.(1000);

  const points = flowPathCaptures.connectorPoints[0]!;
  expect(points).toHaveLength(2);
  expect(points.every(({ z }) => z === 0)).toBe(true);
  expect(Math.abs(points[0].x)).toBeGreaterThan(0);
  expect(Math.abs(points[1].x)).toBeLessThan(3);
  expect(Math.abs(points[1].x)).toBeGreaterThan(Math.abs(points[0].x));
  const beamPoints = flowPathCaptures.beamPoints[0]!;
  expect(beamPoints.every(({ z }) => z === 0)).toBe(true);
  expect(beamPoints.at(-1)?.x).toBe(reverse ? -3 : 3);
  controller.destroy();
});

it('routes a side-entry edge down its source column before turning into the target', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const options = createSceneOptions();
  const controller = createSignalFlowScene({
    ...options,
    connectorOpacity: 1,
    connectorWidth: 2,
    flow: {
      ...options.flow,
      sideEntryEdges: [['root', 'leaf']],
      nodes: options.flow.nodes.map((node) => node.id === 'leaf'
        ? { ...node, position: [3, 3] }
        : node),
    },
  });
  animationFrames.shift()?.(1000);

  const connectorPoints = flowPathCaptures.connectorPoints[0]!;
  expect(connectorPoints.map(({ x }) => x)).toEqual([0, 0, 3]);
  expect(connectorPoints[1].z).toBe(3);
  expect(connectorPoints[2].z).toBe(3);
  expect(flowPathCaptures.beamPoints[0]).toEqual(expect.arrayContaining(connectorPoints));
  controller.destroy();
});

it('suppresses excluded terminal continuations for both connectors and travelling beams', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const options = createSceneOptions();
  const controller = createSignalFlowScene({
    ...options,
    connectorOpacity: 1,
    connectorWidth: 2,
    showContinuationConnectors: true,
    flow: { ...options.flow, terminalContinuationNodes: [] },
  });
  animationFrames.shift()?.(1000);

  expect(flowPathCaptures.connectorPoints).toHaveLength(2);
  expect(flowPathCaptures.connectorPoints.flat().some(({ z }) => z < 0)).toBe(true);
  expect(flowPathCaptures.connectorPoints.flat().some(({ z }) => z > 3)).toBe(false);
  expect(flowPathCaptures.beamPoints[0]?.at(-1)?.z).toBe(3);
  controller.destroy();
});

it('waits for activation and uses a scaled WebGL target with layout-sized CSS3D', () => {
  const animationFrames: FrameRequestCallback[] = [];
  const cancelAnimationFrame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    active: false,
    resolutionScale: 0.7,
  });

  expect(requestAnimationFrame).not.toHaveBeenCalled();
  expect(renderer.setSize).toHaveBeenCalledWith(672, 448, false);
  expect(cssRenderer.setSize).toHaveBeenCalledWith(960, 640);
  expect(renderer.shadowMap.autoUpdate).toBe(false);
  expect(renderer.shadowMap.needsUpdate).toBe(true);

  controller.setActive(true);
  animationFrames.shift()?.(1000);
  expect(renderer.render).toHaveBeenCalledOnce();
  expect(renderer.shadowMap.needsUpdate).toBe(false);
  controller.setActive(false);
  expect(cancelAnimationFrame).toHaveBeenCalled();
  controller.destroy();
});

it('keeps the emphasized light-theme grid covered by continuous ground', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    gridOpacity: 0.2,
    gridMaskRadius: 800,
    theme: {
      ...defaultColors.light,
      scene: {
        ...defaultColors.light.scene,
        gridMajor: '#123456',
      },
    },
  });

  animationFrames.shift()?.(1000);
  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  let gridMaterial: THREE.ShaderMaterial | undefined;
  let gridSize = 0;
  let groundSize = 0;
  scene?.traverse((object) => {
    if (object instanceof THREE.Mesh
      && object.geometry instanceof THREE.PlaneGeometry
      && object.material instanceof THREE.MeshStandardMaterial) {
      groundSize = object.geometry.parameters.width;
    }
    if (
      object instanceof THREE.LineSegments
      && object.material instanceof THREE.ShaderMaterial
      && object.material.uniforms.uMaskColor
    ) {
      gridMaterial = object.material;
      object.geometry.computeBoundingBox();
      gridSize = object.geometry.boundingBox!.getSize(new THREE.Vector3()).x;
    }
  });

  expect(gridMaterial?.uniforms.uMaskColor.value.getHexString()).toBe('123456');
  expect(gridSize).toBeGreaterThan(0);
  expect(groundSize).toBeGreaterThanOrEqual(gridSize);
  controller.destroy();
});

function createSceneOptions() {
  const flow = {
    root: 'root',
    nodes: [
      { id: 'root', position: [0, 0] as [number, number], label: 'Root', size: [2, 1] as [number, number], tier: 0, shape: 'rectangle' as const, svg: 'root.svg' },
      { id: 'leaf', position: [0, 3] as [number, number], label: 'Leaf', size: [2, 1] as [number, number], tier: 1, shape: 'rectangle' as const, svg: 'leaf.svg' },
    ],
    branches: { root: ['leaf'] },
  };
  const theme = defaultColors.light;
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 640 },
    clientWidth: { value: 960 },
  });

  return {
    variant: 'variant-2' as const,
    mode: 'light' as const,
    flow,
    theme,
    assetBasePath: '/assets/nodes',
    interactive: false,
    gridOpacity: 0,
    fogEnabled: true,
    gridDensity: 30,
    gridMaskRadius: 0,
    gridMaskBlur: 0,
    connectorOpacity: 0,
    connectorStroke: 'solid' as const,
    connectorWidth: 0,
    connectorElevation: 0,
    showContinuationConnectors: false,
    pathCurve: 0,
    outlineOpacity: 0,
    outlineWidth: 0,
    nodeScale: 1,
    nodeElevation: 0,
    nodeDepth: 12,
    nodeDepthRandom: 0,
    nodeShape: 'rectangle' as const,
    nodeCornerRadius: 10,
    nodeIconOpacity: 0.9,
    nodeFrontGradientAngle: 32,
    nodeSideXGradientAngle: 18,
    nodeSideZGradientAngle: 18,
    perspectiveEffect: 0,
    cameraPitch: 45,
    cameraZoom: 1,
    emitterX: 0.45,
    emitterY: -4.25,
    minDelay: 0,
    maxDelay: 0,
    speed: 1,
    nodeProgressMode: 'bar' as const,
    progressPadding: 1,
    progressBarHeight: 8,
    concurrentBeams: 1,
    minEmitDelay: 0,
    maxEmitDelay: 0,
    reducedMotion: true,
    elements: {
      canvas: document.createElement('canvas'),
      container,
      cssLayer: document.createElement('div'),
    },
  };
}

it('shifts the camera target vertically without changing scene scale or depth', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const baseController = createSignalFlowScene({
    ...createSceneOptions(),
    cameraYaw: 0,
    cameraTargetOffsetY: 0,
    perspectiveEffect: 75,
  });
  animationFrames.shift()?.(1000);
  const baseCamera = (renderer.render.mock.calls.at(-1)?.[1] as THREE.Camera).clone();
  baseController.destroy();
  animationFrames.length = 0;

  const shiftedController = createSignalFlowScene({
    ...createSceneOptions(),
    cameraYaw: 0,
    cameraTargetOffsetY: 2,
    perspectiveEffect: 75,
  });
  animationFrames.shift()?.(1000);
  const shiftedCamera = (renderer.render.mock.calls.at(-1)?.[1] as THREE.Camera).clone();
  shiftedController.destroy();

  expect(shiftedCamera.position.x - baseCamera.position.x).toBeCloseTo(0, 6);
  expect(shiftedCamera.position.y - baseCamera.position.y).toBeCloseTo(2, 6);
  expect(shiftedCamera.position.z - baseCamera.position.z).toBeCloseTo(0, 6);
  expect(shiftedCamera.projectionMatrix.toArray()).toEqual(baseCamera.projectionMatrix.toArray());
});

it('applies configurable node-shadow parameters to the light and catcher', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
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

  animationFrames.shift()?.(1000);
  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  const light = scene?.children.find((object): object is THREE.DirectionalLight => (
    object instanceof THREE.DirectionalLight
  ));
  const catcher = scene?.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.material instanceof THREE.ShadowMaterial
  ));
  if (!light || !catcher || !(catcher.material instanceof THREE.ShadowMaterial)) {
    throw new Error('Expected a configurable node-shadow light and catcher.');
  }

  expect(light.position.toArray()).toEqual([-4, 9, 3]);
  expect(light.shadow.bias).toBe(-0.001);
  expect(light.shadow.normalBias).toBe(0.04);
  expect(light.shadow.radius).toBe(6);
  expect(light.shadow.blurSamples).toBe(11);
  expect(catcher.material.color.getHexString()).toBe('123456');
  expect(catcher.material.opacity).toBe(0.37);
  controller.destroy();
});

it('finalizes managed gradient textures through BusinessFlow renderer teardown', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene(createSceneOptions());
  const replacement = new THREE.CanvasTexture(document.createElement('canvas'));
  const gradientKey = [
    32,
    defaultColors.light.scene.cardHighlight,
    defaultColors.light.scene.card,
    defaultColors.light.scene.cardShadow,
  ].join('|');
  const originalTexture = getNode3DGradientTexture(renderer as unknown as THREE.WebGLRenderer, gradientKey, () => replacement);
  const disposeTexture = vi.spyOn(originalTexture, 'dispose');

  controller.destroy();

  expect(disposeTexture).toHaveBeenCalledOnce();
  expect(getNode3DGradientTexture(
    renderer as unknown as THREE.WebGLRenderer,
    gradientKey,
    () => replacement,
  )).toBe(replacement);
  expect(renderer.dispose).toHaveBeenCalledOnce();
});

it('reports readiness once after the first WebGL and CSS3D frame completes', () => {
  const animationFrames: FrameRequestCallback[] = [];
  const onReady = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    onReady,
  });

  expect(onReady).not.toHaveBeenCalled();
  animationFrames.shift()?.(1000);
  expect(renderer.render).toHaveBeenCalledOnce();
  expect(cssRenderer.render).toHaveBeenCalledOnce();
  expect(onReady).toHaveBeenCalledOnce();

  animationFrames.shift()?.(1016);
  expect(onReady).toHaveBeenCalledOnce();
  controller.destroy();
});
