import * as THREE from 'three';
import { createBeam3DFlareTexture, createBeam3DObject, type Beam3DObject } from '../Beam3D/createBeam3DObject';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import { advanceFlowLayer3DBeamSlot } from './advanceFlowLayer3DBeamSlot';
import { createFlowLayer3DObjects, type FlowLayer3DObjects } from './createFlowLayer3DObjects';
import { resolveFlowLayer3DPath } from './resolveFlowLayer3D';
import { resolveFlowLayer3DBeamStyle } from './resolveFlowLayer3DBeamStyle';
import { stepFlowLayer3DBeamRun } from './stepFlowLayer3DBeamRun';
import type {
  FlowLayer3DBeamRun,
  FlowLayer3DSceneController,
  FlowLayer3DSceneOptions,
} from './types';

const flareStops = [
  'rgba(255,255,255,1)',
  'rgba(201,235,199,.96)',
  'rgba(68,156,64,.62)',
  'rgba(68,156,64,.18)',
  'rgba(68,156,64,0)',
] as const;

type BeamSlot = {
  beam: Beam3DObject;
  deliveredArrivalIds: Set<string>;
  generation: number;
  pendingNextRun: boolean;
  run: FlowLayer3DBeamRun | null;
  startedAtMs: number;
};

function disposeObjectResources(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Sprite)) {
      return;
    }
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material?.dispose());
  });
}

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    return renderer;
  } catch (error) {
    renderer?.dispose();
    throw error;
  }
}

export function createFlowLayer3DScene(options: FlowLayer3DSceneOptions): FlowLayer3DSceneController {
  const {
    beam: beamStyle,
    beamSource,
    canvas,
    connector,
    container,
    onArrival,
    paths,
    reducedMotion = false,
    worldHeight = 20,
  } = options;
  const renderer = createRenderer(canvas);

  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(0, 20, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);
  const timer = new THREE.Timer();
  const beamSlots: BeamSlot[] = [];
  let connectorObjects: FlowLayer3DObjects | undefined;
  let frameId = 0;
  let firstFrameElapsed: number | undefined;
  let destroyed = false;
  let aspectRatio = 1;
  let flareTexture: THREE.Texture | undefined;
  let resizeObserver: ResizeObserver | undefined;

  function resolvePath(path: FlowLayer3DBeamRun['path']) {
    const route = resolveFlowLayer3DPath(path, { aspectRatio, worldHeight });
    return route ? resolveFlowPath3D(route.path) : null;
  }

  function rebuildConnectors() {
    connectorObjects?.destroy();
    if (connectorObjects) scene.remove(connectorObjects.group);
    connectorObjects = createFlowLayer3DObjects({
      aspectRatio,
      connector,
      paths,
      worldHeight,
    });
    scene.add(connectorObjects.group);
  }

  function assignRun(slot: BeamSlot, run: FlowLayer3DBeamRun | null, nowMs: number) {
    slot.run = run;
    slot.startedAtMs = nowMs;
    slot.deliveredArrivalIds.clear();
    if (!run) {
      slot.beam.setVisible(false);
      return;
    }
    const path = resolvePath(run.path);
    if (!path) {
      slot.run = null;
      slot.beam.setVisible(false);
      return;
    }
    slot.beam.setPath(path);
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
        generation: 0,
        pendingNextRun: false,
        run: null,
        startedAtMs: 0,
      };
      beamSlots.push(slot);
      scene.add(beam.group);
      loadNextRun(slot, index, 0, 0);
    }
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const nextAspectRatio = width / height;
    const aspectChanged = Math.abs(nextAspectRatio - aspectRatio) > 0.0001;
    aspectRatio = nextAspectRatio;
    const halfHeight = worldHeight / 2;
    camera.left = -halfHeight * aspectRatio;
    camera.right = halfHeight * aspectRatio;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (aspectChanged) {
      rebuildConnectors();
      beamSlots.forEach((slot) => {
        if (!slot.run) return;
        const path = resolvePath(slot.run.path);
        if (path) slot.beam.setPath(path);
      });
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
    beamSlots.forEach((slot, index) => {
      if (slot.pendingNextRun) loadNextRun(slot, index, slot.generation + 1, nowMs);
      const state = slot.run
        ? stepFlowLayer3DBeamRun(slot.run, nowMs - slot.startedAtMs, slot.deliveredArrivalIds)
        : { arrivals: [], completed: false, progress: 0 };
      state.arrivals.forEach((arrival) => {
        slot.deliveredArrivalIds.add(arrival.id);
        onArrival?.({ arrival, generation: slot.generation, runId: slot.run!.id, slot: index });
      });
      slot.beam.update({
        packetVisibility: slot.run ? 1 : 0,
        phase: index,
        progress: state.progress,
        time,
        visibility: slot.run ? 1 : 0,
      });
      if (slot.run && state.completed) loadNextRun(slot, index, slot.generation + 1, nowMs);
    });
    renderer.render(scene, camera);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    connectorObjects?.destroy();
    if (connectorObjects) scene.remove(connectorObjects.group);
    beamSlots.forEach(({ beam }) => {
      disposeObjectResources(beam.group);
      scene.remove(beam.group);
    });
    flareTexture?.dispose();
    flareTexture = undefined;
    beamSlots.length = 0;
    renderer.dispose();
  }

  try {
    rebuildConnectors();
    createBeams();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    frameId = requestAnimationFrame(animate);
  } catch (error) {
    destroy();
    throw error;
  }

  return {
    destroy,
  };
}
