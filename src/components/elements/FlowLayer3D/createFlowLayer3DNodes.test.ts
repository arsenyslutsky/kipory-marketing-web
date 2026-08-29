import * as THREE from 'three';
import { afterEach, expect, it, vi } from 'vitest';
import { createNode3DObject } from '../Node3D/createNode3DObject';
import { createFlowLayer3DNodes } from './createFlowLayer3DNodes';

vi.mock('../Node3D/createNode3DObject', () => ({
  createNode3DObject: vi.fn(() => new THREE.Group()),
}));

afterEach(() => {
  vi.mocked(createNode3DObject).mockClear();
  vi.mocked(createNode3DObject).mockImplementation(() => new THREE.Group());
});

const nodeStyle = {
  assetBasePath: '/assets/nodes',
  frontGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  mode: 'dark' as const,
  nodeCornerRadius: 12,
  outlineOpacity: 0.5,
  outlineWidth: 1,
  progressBarHeight: 8,
  progressMode: 'outline' as const,
  progressPadding: 2,
  sideXGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  sideZGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
};

it('composes valid nodes, skips invalid descriptors, and clears them on destroy', () => {
  const renderer = {} as THREE.WebGLRenderer;
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const nodes = createFlowLayer3DNodes({
    aspectRatio: 0.5,
    nodeStyle,
    nodes: [
      {
        cardDepth: 40,
        glowIntensity: 0.8,
        height: 12,
        icon: 'server.svg',
        iconColor: '#f3f5ef',
        iconStrokeColor: '#234567',
        iconOpacity: 1,
        id: 'server',
        position: [0.2, 0.5],
        progress: 0.6,
        shape: 'square',
        tier: 2,
        width: 48,
      },
      {
        cardDepth: 40,
        height: 0,
        icon: 'invalid.svg',
        iconColor: '#fff',
        iconOpacity: 1,
        id: 'invalid',
        position: [0.4, 0.5],
        shape: 'square',
        tier: 1,
        width: 48,
      },
    ],
    renderer,
    viewportHeight: 640,
  });

  expect(createNode3DObject).toHaveBeenCalledWith(expect.objectContaining({
    assetBasePath: '/assets/nodes',
    cardDepth: 1.25,
    fogEnabled: false,
    height: 0.375,
    icon: 'server.svg',
    iconColor: '#f3f5ef',
    iconStrokeColor: '#234567',
    id: 'server',
    isDark: true,
    isVariant2: true,
    position: [-3, 0],
    progressMode: 'outline',
    renderer,
    shape: 'square',
    width: 1.5,
  }));
  expect(nodes.nodes).toHaveLength(1);
  expect(nodes.group.children).toHaveLength(1);
  expect(warn).toHaveBeenCalledWith('Skipping invalid FlowLayer3D node:', 'invalid');

  nodes.destroy();
  nodes.destroy();

  expect(nodes.group.children).toHaveLength(0);
  warn.mockRestore();
});

it('cleans up already-created nodes when construction fails', () => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial();
  const firstNode = new THREE.Group();
  firstNode.add(new THREE.Mesh(geometry, material));
  let calls = 0;
  vi.mocked(createNode3DObject).mockImplementation(() => {
    calls += 1;
    if (calls === 1) return firstNode;
    throw new Error('second node failed');
  });
  const disposeGeometry = vi.spyOn(geometry, 'dispose');
  const disposeMaterial = vi.spyOn(material, 'dispose');

  expect(() => createFlowLayer3DNodes({
    aspectRatio: 1,
    nodeStyle,
    nodes: [
      {
        cardDepth: 40, height: 12, icon: 'first.svg', iconColor: '#fff', iconOpacity: 1,
        id: 'first', position: [0.2, 0.5], shape: 'square', tier: 1, width: 48,
      },
      {
        cardDepth: 40, height: 12, icon: 'second.svg', iconColor: '#fff', iconOpacity: 1,
        id: 'second', position: [0.8, 0.5], shape: 'square', tier: 1, width: 48,
      },
    ],
    renderer: {} as THREE.WebGLRenderer,
    viewportHeight: 640,
  })).toThrow('second node failed');

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
  expect(firstNode.parent).toBeNull();
});

it('updates progress controls by node id and restores configured progress for inactive nodes', () => {
  const serverProgress = vi.fn();
  const graphProgress = vi.fn();
  vi.mocked(createNode3DObject)
    .mockImplementationOnce(() => {
      const node = new THREE.Group();
      node.userData = {
        id: 'server',
        nodeProgressControl: { setProgress: serverProgress },
      };
      return node;
    })
    .mockImplementationOnce(() => {
      const node = new THREE.Group();
      node.userData = {
        id: 'graph',
        nodeProgressControl: { setProgress: graphProgress },
      };
      return node;
    });

  const flowNodes = createFlowLayer3DNodes({
    aspectRatio: 1,
    nodeStyle,
    nodes: [
      {
        cardDepth: 40, height: 12, icon: 'server.svg', iconColor: '#fff', iconOpacity: 1,
        id: 'server', position: [0.2, 0.5], progress: 0.25, shape: 'square', tier: 1, width: 48,
      },
      {
        cardDepth: 40, height: 12, icon: 'graph.svg', iconColor: '#fff', iconOpacity: 1,
        id: 'graph', position: [0.8, 0.5], shape: 'square', tier: 1, width: 48,
      },
    ],
    renderer: {} as THREE.WebGLRenderer,
    viewportHeight: 640,
  }) as ReturnType<typeof createFlowLayer3DNodes> & {
    setProgress?: (progressByNode: ReadonlyMap<string, number>) => void;
  };

  expect(flowNodes.setProgress).toBeTypeOf('function');
  flowNodes.setProgress?.(new Map([['server', 0.4]]));

  expect(serverProgress).toHaveBeenLastCalledWith(0.4);
  expect(graphProgress).toHaveBeenLastCalledWith(undefined);

  flowNodes.setProgress?.(new Map());

  expect(serverProgress).toHaveBeenLastCalledWith(0.25);
  expect(graphProgress).toHaveBeenLastCalledWith(undefined);
});
