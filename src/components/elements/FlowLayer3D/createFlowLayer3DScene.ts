import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { businessFlowPalette } from '@/features/business-flow-palette';
import { createBeam3DFlareTexture, createBeam3DObject, type Beam3DObject } from '../Beam3D/createBeam3DObject';
import { disposeNode3DGradientTextures } from '../Node3D/node3DGradientTextureCache';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import { advanceFlowLayer3DBeamSlot } from './advanceFlowLayer3DBeamSlot';
import { addNodeProcessingDelays } from './addNodeProcessingDelays';
import { createFlowLayer3DNodes, type FlowLayer3DNodes } from './createFlowLayer3DNodes';
import { createFlowLayer3DObjects, type FlowLayer3DObjects } from './createFlowLayer3DObjects';
import { disposeFlowLayer3DObjectResources } from './disposeFlowLayer3DObjectResources';
import { resolveFlowLayer3DPath } from './resolveFlowLayer3D';
import { resolveFlowLayer3DBeamStyle } from './resolveFlowLayer3DBeamStyle';
import { projectFlowLayer3DArrivals } from './projectFlowLayer3DArrivals';
import { stepFlowLayer3DBeamRun } from './stepFlowLayer3DBeamRun';
import type {
  FlowLayer3DBeamRun,
  FlowLayer3DSceneController,
  FlowLayer3DSceneOptions,
} from './types';

const flareStops = businessFlowPalette.flareStops;

type BeamSlot = {
  beam: Beam3DObject;
  deliveredArrivalIds: Set<string>;
  deliveredProcessingCompletionIds: Set<string>;
  generation: number;
  nextRunStartedAtMs: number;
  pendingNextRun: boolean;
  run: FlowLayer3DBeamRun | null;
  startedAtMs: number;
};

function createRenderer(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer | undefined;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    return renderer;
  } catch (error) {
    renderer?.dispose();
    throw error;
  }
}

function createCssRenderer(cssLayer: HTMLElement) {
  const cssRenderer = new CSS3DRenderer();
  Object.assign(cssRenderer.domElement.style, {
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
  });
  cssLayer.append(cssRenderer.domElement);
  return cssRenderer;
}

export function createFlowLayer3DScene(options: FlowLayer3DSceneOptions): FlowLayer3DSceneController {
  const {
    beam: beamStyle,
    beamSource,
    canvas,
    connector,
    container,
    cssLayer,
    nodes = [],
    nodeStyle,
    onArrival,
    onError,
    onReady,
    paths,
    reducedMotion = false,
    worldHeight = 20,
  } = options;
  const renderer = createRenderer(canvas);
  let cssRenderer: CSS3DRenderer;
  try {
    cssRenderer = createCssRenderer(cssLayer);
  } catch (error) {
    renderer.dispose();
    throw error;
  }

  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(0, 20, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);
  const shadowLight = new THREE.DirectionalLight(0xffffff, 1);
  shadowLight.position.set(-6, 14, -5);
  const shadowDirection = shadowLight.position.clone().normalize();
  shadowLight.castShadow = true;
  shadowLight.shadow.mapSize.set(1024, 1024);
  shadowLight.shadow.bias = -0.0003;
  shadowLight.shadow.normalBias = 0.025;
  shadowLight.shadow.radius = 8;
  shadowLight.shadow.blurSamples = 16;

  const shadowCatcherGeometry = new THREE.PlaneGeometry(80, 80);
  const shadowCatcherMaterial = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: 0.5,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const shadowCatcher = new THREE.Mesh(shadowCatcherGeometry, shadowCatcherMaterial);
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = 0.12;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.renderOrder = -90;
  scene.add(shadowLight, shadowLight.target, shadowCatcher);
  const timer = new THREE.Timer();
  const beamSlots: BeamSlot[] = [];
  let connectorObjects: FlowLayer3DObjects | undefined;
  let nodeObjects: FlowLayer3DNodes | undefined;
  let frameId = 0;
  let firstFrameElapsed: number | undefined;
  let ready = false;
  let destroyed = false;
  let aspectRatio = 1;
  let flareTexture: THREE.Texture | undefined;
  let measuredHeight = 0;
  let measuredWidth = 0;
  let resizeObserver: ResizeObserver | undefined;

  function resolvePath(path: FlowLayer3DBeamRun['path']) {
    const route = resolveFlowLayer3DPath(path, { aspectRatio, worldHeight });
    return route ? resolveFlowPath3D(route.path) : null;
  }

  function rebuildConnectors() {
    const nextConnectorObjects = createFlowLayer3DObjects({
      aspectRatio,
      connector,
      paths,
      worldHeight,
    });
    const previousConnectorObjects = connectorObjects;
    connectorObjects = nextConnectorObjects;
    scene.add(nextConnectorObjects.group);
    previousConnectorObjects?.destroy();
    if (previousConnectorObjects) scene.remove(previousConnectorObjects.group);
  }

  function rebuildNodes(viewportHeight: number) {
    if (!nodeStyle || nodes.length === 0) {
      nodeObjects?.destroy();
      if (nodeObjects) scene.remove(nodeObjects.group);
      nodeObjects = undefined;
      return;
    }
    const nextNodeObjects = createFlowLayer3DNodes({
      aspectRatio,
      nodeStyle,
      nodes,
      renderer,
      viewportHeight,
      worldHeight,
    });
    nextNodeObjects.group.traverse((object) => {
      if (object instanceof CSS3DObject) object.element.style.pointerEvents = 'none';
    });
    const previousNodeObjects = nodeObjects;
    nodeObjects = nextNodeObjects;
    scene.add(nextNodeObjects.group);
    previousNodeObjects?.destroy();
    if (previousNodeObjects) scene.remove(previousNodeObjects.group);
  }

  function assignRun(slot: BeamSlot, run: FlowLayer3DBeamRun | null, nowMs: number) {
    let nextRun = run && nodeStyle
      ? addNodeProcessingDelays(
        run,
        nodeStyle.progressMinDelay ?? 0,
        nodeStyle.progressMaxDelay ?? 0,
      )
      : run;
    slot.startedAtMs = nowMs;
    slot.deliveredArrivalIds.clear();
    slot.deliveredProcessingCompletionIds.clear();
    if (!nextRun) {
      slot.run = null;
      slot.beam.setVisible(false);
      return;
    }
    const path = resolvePath(nextRun.path);
    if (!path) {
      slot.run = null;
      slot.beam.setVisible(false);
      return;
    }
    if (nextRun.arrivals?.length) {
      nextRun = {
        ...nextRun,
        arrivals: projectFlowLayer3DArrivals(nextRun.arrivals, path, { aspectRatio, worldHeight }),
      };
    }
    slot.run = nextRun;
    slot.beam.setPath(path);
    slot.beam.setTrailLength(slot.run.trailLength ?? beamStyle.trailLength);
    slot.beam.setVisible(true);
  }

  function loadNextRun(slot: BeamSlot, index: number, generation: number, nowMs: number) {
    const next = advanceFlowLayer3DBeamSlot(
      beamSource,
      index,
      generation,
      (run) => resolvePath(run.path) !== null,
    );
    slot.generation = next.generation;
    slot.nextRunStartedAtMs = nowMs;
    slot.pendingNextRun = next.status === 'invalid';
    assignRun(slot, next.run, nowMs);
  }

  function createBeams() {
    if (!beamStyle.enabled || reducedMotion || beamSource.slots <= 0) return;
    flareTexture = createBeam3DFlareTexture(flareStops);
    const fallbackPath = resolvePath({
      id: 'flow-layer-3d-fallback',
      points: [[0, 0.5], [1, 0.5]],
    });
    if (!fallbackPath) {
      flareTexture.dispose();
      flareTexture = undefined;
      return;
    }
    const slotCount = Math.max(0, Math.floor(beamSource.slots));
    const beamObjectStyle = resolveFlowLayer3DBeamStyle(beamStyle);
    for (let index = 0; index < slotCount; index += 1) {
      const beam = createBeam3DObject({
        ...beamObjectStyle,
        colors: {
          beam: beamStyle.beamColor,
          beamHighlight: beamStyle.beamHighlightColor,
          flare: beamStyle.beamHighlightColor,
          flareStops,
          packetCore: beamStyle.beamHighlightColor,
          packetHalo: beamStyle.beamColor,
        },
        flareTexture,
        fogEnabled: false,
        mode: 'dark',
        path: fallbackPath,
        style: 'ribbon',
      });
      const slot: BeamSlot = {
        beam,
        deliveredArrivalIds: new Set(),
        deliveredProcessingCompletionIds: new Set(),
        generation: 0,
        nextRunStartedAtMs: 0,
        pendingNextRun: false,
        run: null,
        startedAtMs: 0,
      };
      beamSlots.push(slot);
      scene.add(beam.group);
      loadNextRun(slot, index, 0, 0);
    }
  }

  function resizeShadowFrustum(halfWidth: number, halfHeight: number) {
    const shadowPadding = Math.min(8, Math.max(2.5, worldHeight * 0.24));
    const shadowDistance = Math.max(16, Math.hypot(halfWidth, halfHeight) + shadowPadding + 1);
    shadowLight.position.copy(shadowDirection).multiplyScalar(shadowDistance);
    scene.updateMatrixWorld(true);
    shadowLight.shadow.updateMatrices(shadowLight);

    const shadowCamera = shadowLight.shadow.camera;
    const visibleCorners = [
      new THREE.Vector3(-halfWidth, 0, -halfHeight),
      new THREE.Vector3(-halfWidth, 0, halfHeight),
      new THREE.Vector3(halfWidth, 0, -halfHeight),
      new THREE.Vector3(halfWidth, 0, halfHeight),
    ];
    let left = Infinity;
    let right = -Infinity;
    let top = -Infinity;
    let bottom = Infinity;
    let near = Infinity;
    let far = -Infinity;
    visibleCorners.forEach((corner) => {
      const point = corner.applyMatrix4(shadowCamera.matrixWorldInverse);
      left = Math.min(left, point.x);
      right = Math.max(right, point.x);
      top = Math.max(top, point.y);
      bottom = Math.min(bottom, point.y);
      near = Math.min(near, -point.z);
      far = Math.max(far, -point.z);
    });
    shadowCamera.left = left - shadowPadding;
    shadowCamera.right = right + shadowPadding;
    shadowCamera.top = top + shadowPadding;
    shadowCamera.bottom = bottom - shadowPadding;
    shadowCamera.near = Math.max(0.1, near - shadowPadding);
    shadowCamera.far = far + shadowPadding;
    shadowCamera.updateProjectionMatrix();
    shadowLight.shadow.needsUpdate = true;
    renderer.shadowMap.needsUpdate = true;
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const nextAspectRatio = width / height;
    const sizeChanged = width !== measuredWidth || height !== measuredHeight;
    const aspectChanged = Math.abs(nextAspectRatio - aspectRatio) > 0.0001;
    aspectRatio = nextAspectRatio;
    const halfHeight = worldHeight / 2;
    camera.left = -halfHeight * aspectRatio;
    camera.right = halfHeight * aspectRatio;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    resizeShadowFrustum(halfHeight * aspectRatio, halfHeight);
    renderer.setSize(width, height, false);
    cssRenderer.setSize(width, height);
    if (sizeChanged) rebuildNodes(height);
    if (aspectChanged || !connectorObjects) {
      rebuildConnectors();
      beamSlots.forEach((slot) => {
        if (!slot.run) return;
        const path = resolvePath(slot.run.path);
        if (!path) return;
        slot.beam.setPath(path);
        if (slot.run.arrivals?.length) {
          slot.run = {
            ...slot.run,
            arrivals: projectFlowLayer3DArrivals(
              slot.run.arrivals,
              path,
              { aspectRatio, worldHeight },
            ),
          };
        }
      });
    }
    measuredWidth = width;
    measuredHeight = height;
  }

  function handleResize() {
    if (destroyed) return;
    try {
      resize();
    } catch (error) {
      destroy();
      onError?.(error);
    }
  }

  function animate(timestamp: DOMHighResTimeStamp) {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
    timer.update(timestamp);
    const elapsed = timer.getElapsed();
    firstFrameElapsed ??= elapsed;
    const time = elapsed - firstFrameElapsed;
    const nowMs = time * 1000;
    const nodeProgressBatches = new Map<string, number[]>();
    beamSlots.forEach((slot, index) => {
      if (slot.pendingNextRun) {
        loadNextRun(slot, index, slot.generation + 1, slot.nextRunStartedAtMs);
      }
      const state = slot.run
        ? stepFlowLayer3DBeamRun(slot.run, nowMs - slot.startedAtMs, slot.deliveredArrivalIds)
        : {
          arrivals: [],
          activeProcessing: undefined,
          completedProcessingIds: [],
          completed: false,
          endElapsedMs: 0,
          progress: 0,
          started: false,
          visibility: 0,
        };
      state.arrivals.forEach((arrival) => {
        slot.deliveredArrivalIds.add(arrival.id);
        onArrival?.({ arrival, generation: slot.generation, runId: slot.run!.id, slot: index });
      });
      if (state.activeProcessing) {
        const batch = nodeProgressBatches.get(state.activeProcessing.id) ?? [];
        batch.push(state.activeProcessing.progress);
        nodeProgressBatches.set(state.activeProcessing.id, batch);
      }
      state.completedProcessingIds.forEach((id) => {
        if (slot.deliveredProcessingCompletionIds.has(id)) return;
        slot.deliveredProcessingCompletionIds.add(id);
        const batch = nodeProgressBatches.get(id) ?? [];
        batch.push(1);
        nodeProgressBatches.set(id, batch);
      });
      const active = Boolean(slot.run && state.started);
      const visibility = active ? state.visibility : 0;
      slot.beam.update({
        packetVisibility: visibility,
        phase: index,
        progress: state.progress,
        time,
        visibility,
      });
      if (slot.run && state.completed) {
        slot.nextRunStartedAtMs = slot.startedAtMs + state.endElapsedMs;
        slot.pendingNextRun = true;
      }
    });
    nodeObjects?.setProgress?.(new Map(
      [...nodeProgressBatches].map(([id, batch]) => [
        id,
        batch.reduce((sum, value) => sum + value, 0) / batch.length,
      ]),
    ));
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady?.();
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    nodeObjects?.destroy();
    if (nodeObjects) scene.remove(nodeObjects.group);
    nodeObjects = undefined;
    connectorObjects?.destroy();
    if (connectorObjects) scene.remove(connectorObjects.group);
    const excludedBeamTextures = flareTexture ? new Set([flareTexture]) : undefined;
    beamSlots.forEach(({ beam }) => {
      disposeFlowLayer3DObjectResources(beam.group, { excludedTextures: excludedBeamTextures });
      scene.remove(beam.group);
    });
    flareTexture?.dispose();
    flareTexture = undefined;
    beamSlots.length = 0;
    disposeNode3DGradientTextures(renderer);
    scene.remove(shadowLight, shadowLight.target, shadowCatcher);
    shadowCatcherGeometry.dispose();
    shadowCatcherMaterial.dispose();
    shadowLight.dispose();
    cssRenderer.domElement.remove();
    renderer.dispose();
  }

  try {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    resize();
    createBeams();
    frameId = requestAnimationFrame(animate);
  } catch (error) {
    destroy();
    throw error;
  }

  return {
    destroy,
  };
}
