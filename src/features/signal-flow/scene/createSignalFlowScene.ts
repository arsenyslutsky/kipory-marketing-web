import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import type { ConnectorStrokeType, FlowConfig, NodeGeometryShape, NodeProgressMode, NodeShape, SignalFlowMode, SignalFlowTheme, SignalFlowVariant } from '../types';

const svgAssetMarkupCache = new Map<string, Promise<string>>();

function loadSvgAssetMarkup(url: string) {
  const cached = svgAssetMarkupCache.get(url);
  if (cached) return cached;

  const request = fetch(url, { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Unable to load SVG asset: ${response.status}`);
    }
    return response.text();
  });
  svgAssetMarkupCache.set(url, request);
  return request;
}

interface SceneElements {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  cssLayer: HTMLElement;
}

interface SceneOptions {
  variant: SignalFlowVariant;
  mode: SignalFlowMode;
  flow: FlowConfig;
  theme: SignalFlowTheme;
  assetBasePath: string;
  interactive: boolean;
  gridOpacity: number;
  fogEnabled: boolean;
  gridDensity: number;
  gridMaskRadius: number;
  gridMaskBlur: number;
  connectorOpacity: number;
  connectorStroke: ConnectorStrokeType;
  connectorWidth: number;
  showContinuationConnectors: boolean;
  pathCurve: number;
  outlineOpacity: number;
  outlineWidth: number;
  nodeScale: number;
  nodeDepth: number;
  nodeDepthRandom: number;
  nodeShape: NodeShape;
  nodeCornerRadius: number;
  nodeIconOpacity: number;
  nodeFrontGradientAngle: number;
  nodeSideXGradientAngle: number;
  nodeSideZGradientAngle: number;
  nodeFrontGradientStartColor?: string;
  nodeFrontGradientMidColor?: string;
  nodeFrontGradientEndColor?: string;
  nodeSideXGradientStartColor?: string;
  nodeSideXGradientMidColor?: string;
  nodeSideXGradientEndColor?: string;
  nodeSideZGradientStartColor?: string;
  nodeSideZGradientMidColor?: string;
  nodeSideZGradientEndColor?: string;
  perspectiveEffect: number;
  cameraPitch: number;
  cameraYaw?: number;
  cameraZoom: number;
  emitterX: number;
  emitterY: number;
  minDelay: number;
  maxDelay: number;
  speed: number;
  nodeProgressMode: NodeProgressMode;
  progressPadding: number;
  progressBarHeight: number;
  concurrentBeams: number;
  minEmitDelay: number;
  maxEmitDelay: number;
  reducedMotion: boolean;
  elements: SceneElements;
}

export interface SignalFlowSceneController {
  reroute: () => void;
  setCameraZoom: (zoom: number) => void;
  destroy: () => void;
}

interface RuntimeNode {
  p: [number, number];
  label: string;
  svg: string;
  size: [number, number];
  tier: number;
  shape: NodeGeometryShape;
  height: number;
}

interface NodeGlowState {
  value: number;
  phase: 'idle' | 'in' | 'out';
  startedAt: number;
  armed: boolean;
}

interface NodeProgressControl {
  object: CSS3DObject;
  setProgress: (progress?: number) => void;
}

interface ResolvedNodeGradient {
  angle: number;
  start: string;
  mid: string;
  end: string;
}

interface RouteStop {
  id: string;
  curveProgress: number;
  travelProgress: number;
  delay: number;
  arrivalTime: number;
  endTime: number;
}

interface BeamUniforms {
  uProgress: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uVisibility: { value: number };
  uStartFade: { value: number };
}

interface BeamVisual {
  uniforms: BeamUniforms;
  core: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  glow: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  aura: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  packet: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  packetHalo: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  packetFlare: THREE.Sprite;
}

interface BeamRun {
  index: number;
  route: string[];
  curve: THREE.Curve<THREE.Vector3>;
  stops: RouteStop[];
  routeDuration: number;
  startedAt: number;
  scheduledAt: number;
  active: boolean;
  progress: number;
  position: THREE.Vector3;
  activeStop?: RouteStop;
  activeStopProgress: number;
  visual: BeamVisual;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function inverseSmootherstep(value: number) {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) * 0.5;
    const eased = THREE.MathUtils.smootherstep(middle, 0, 1);
    if (eased < value) low = middle;
    else high = middle;
  }
  return (low + high) * 0.5;
}

function makeRibbonGeometry(points: THREE.Vector3[], halfWidth: number, yOffset = 0) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const distances = [0];

  for (let i = 1; i < points.length; i++) {
    distances[i] = distances[i - 1] + points[i].distanceTo(points[i - 1]);
  }
  const totalLength = distances.at(-1) || 1;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const previous = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const tangent = new THREE.Vector2(next.x - previous.x, next.z - previous.z);
    if (tangent.lengthSq() < 0.000001) {
      tangent.set(next.x - point.x, next.z - point.z);
    }
    if (tangent.lengthSq() < 0.000001) {
      tangent.set(point.x - previous.x, point.z - previous.z);
    }
    tangent.normalize();
    const offset = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(halfWidth);
    const u = distances[i] / totalLength;

    positions.push(point.x + offset.x, point.y + yOffset, point.z + offset.y);
    positions.push(point.x - offset.x, point.y + yOffset, point.z - offset.y);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(u, 0, u, 1);

    if (i < points.length - 1) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function makeGlowDiscTrailGeometry(points: THREE.Vector3[], radius: number, spacing: number, yOffset = 0) {
  const geometry = new THREE.BufferGeometry();
  if (points.length < 2) return geometry;
  const segmentLengths: number[] = [];
  const cumulative = [0];
  for (let index = 0; index < points.length - 1; index++) {
    const length = points[index].distanceTo(points[index + 1]);
    segmentLengths.push(length);
    cumulative.push(cumulative[index] + length);
  }
  const totalLength = cumulative.at(-1) || 0;
  if (totalLength < 0.001) return geometry;

  const positions: number[] = [];
  const uvs: number[] = [];
  const pathProgress: number[] = [];
  const indices: number[] = [];
  const sampleCount = Math.max(2, Math.ceil(totalLength / spacing));
  let segmentIndex = 0;

  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex++) {
    const distance = totalLength * (sampleIndex / sampleCount);
    while (segmentIndex < segmentLengths.length - 1 && distance > cumulative[segmentIndex + 1]) {
      segmentIndex += 1;
    }
    const segmentLength = Math.max(segmentLengths[segmentIndex], 0.000001);
    const localProgress = THREE.MathUtils.clamp((distance - cumulative[segmentIndex]) / segmentLength, 0, 1);
    const point = new THREE.Vector3().lerpVectors(points[segmentIndex], points[segmentIndex + 1], localProgress);
    const vertexOffset = positions.length / 3;
    positions.push(
      point.x - radius, point.y + yOffset, point.z - radius,
      point.x + radius, point.y + yOffset, point.z - radius,
      point.x - radius, point.y + yOffset, point.z + radius,
      point.x + radius, point.y + yOffset, point.z + radius,
    );
    uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    const progress = distance / totalLength;
    pathProgress.push(progress, progress, progress, progress);
    indices.push(
      vertexOffset, vertexOffset + 2, vertexOffset + 1,
      vertexOffset + 1, vertexOffset + 2, vertexOffset + 3,
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aPathProgress', new THREE.Float32BufferAttribute(pathProgress, 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function roundedPolylinePoints(points: THREE.Vector3[], amount: number, cornerSteps = 14) {
  const resolvedAmount = THREE.MathUtils.clamp(amount, 0, 1);
  if (points.length < 3 || resolvedAmount === 0) return points.map((point) => point.clone());
  const rounded = [points[0].clone()];

  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incoming = previous.clone().sub(corner);
    const outgoing = next.clone().sub(corner);
    const incomingLength = incoming.length();
    const outgoingLength = outgoing.length();

    if (incomingLength < 0.001 || outgoingLength < 0.001) continue;
    incoming.normalize();
    outgoing.normalize();
    if (incoming.dot(outgoing) < -0.999) {
      rounded.push(corner.clone());
      continue;
    }

    const trim = Math.min(incomingLength, outgoingLength) * 0.49 * resolvedAmount;
    const entry = corner.clone().addScaledVector(incoming, trim);
    const exit = corner.clone().addScaledVector(outgoing, trim);
    const previousRounded = rounded.at(-1);
    if (!previousRounded || previousRounded.distanceToSquared(entry) > 0.000001) rounded.push(entry);

    for (let step = 1; step <= cornerSteps; step++) {
      const t = step / cornerSteps;
      const inverse = 1 - t;
      rounded.push(new THREE.Vector3(
        inverse * inverse * entry.x + 2 * inverse * t * corner.x + t * t * exit.x,
        inverse * inverse * entry.y + 2 * inverse * t * corner.y + t * t * exit.y,
        inverse * inverse * entry.z + 2 * inverse * t * corner.z + t * t * exit.z,
      ));
    }
  }

  rounded.push(points.at(-1)!.clone());
  return rounded;
}

export function createSignalFlowScene(options: SceneOptions): SignalFlowSceneController {
  const {
    variant,
    mode,
    flow,
    theme,
    assetBasePath,
    interactive,
    gridOpacity,
    fogEnabled,
    gridDensity,
    gridMaskRadius,
    gridMaskBlur,
    connectorOpacity,
    connectorStroke,
    connectorWidth,
    showContinuationConnectors,
    pathCurve,
    outlineOpacity,
    outlineWidth,
    nodeScale,
    nodeDepth,
    nodeDepthRandom,
    nodeShape,
    nodeCornerRadius,
    nodeIconOpacity,
    nodeFrontGradientAngle,
    nodeSideXGradientAngle,
    nodeSideZGradientAngle,
    nodeFrontGradientStartColor,
    nodeFrontGradientMidColor,
    nodeFrontGradientEndColor,
    nodeSideXGradientStartColor,
    nodeSideXGradientMidColor,
    nodeSideXGradientEndColor,
    nodeSideZGradientStartColor,
    nodeSideZGradientMidColor,
    nodeSideZGradientEndColor,
    perspectiveEffect,
    cameraPitch,
    cameraYaw,
    cameraZoom,
    emitterX,
    emitterY,
    minDelay,
    maxDelay,
    speed,
    nodeProgressMode,
    progressPadding,
    progressBarHeight,
    concurrentBeams,
    minEmitDelay,
    maxEmitDelay,
    reducedMotion,
    elements,
  } = options;
  const { container, canvas, cssLayer } = elements;
  const isVariant2 = variant === 'variant-2';
  const isDark = mode === 'dark';
  const palette = theme.scene;
  const effects = theme.effects;
  const normalizeGradientAngle = (angle: number, fallback: number) => (
    Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : fallback
  );
  const frontGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(nodeFrontGradientAngle, 32),
    start: nodeFrontGradientStartColor || palette.cardHighlight,
    mid: nodeFrontGradientMidColor || palette.card,
    end: nodeFrontGradientEndColor || palette.cardShadow,
  };
  const sideXGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(nodeSideXGradientAngle, 18),
    start: nodeSideXGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: nodeSideXGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: nodeSideXGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const sideZGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(nodeSideZGradientAngle, 18),
    start: nodeSideZGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: nodeSideZGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: nodeSideZGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const resolvedNodeScale = THREE.MathUtils.clamp(nodeScale, 0.1, 3);
  const nodeDepthPixels = THREE.MathUtils.clamp(Math.round(nodeDepth), 1, 64);
  const nodeDepthRandomRatio = THREE.MathUtils.clamp(nodeDepthRandom, 0, 100) / 100;
  const pickNodeHeight = () => {
    const variation = (Math.random() * 2 - 1) * nodeDepthRandomRatio;
    return Math.max(nodeDepthPixels * (1 + variation), 0.1) * (0.22 / 12);
  };
  const allNodeShapes: readonly NodeGeometryShape[] = ['rectangle', 'circle', 'square', 'triangle', 'hexagon'];
  const nodeShapePool: readonly NodeGeometryShape[] = nodeShape === 'all'
    ? allNodeShapes
    : nodeShape === 'square-triangle-circle'
      ? ['square', 'triangle', 'circle', 'hexagon']
      : nodeShape === 'square-rectangle-circle'
        ? ['square', 'rectangle', 'circle', 'hexagon']
        : allNodeShapes.includes(nodeShape as NodeGeometryShape)
          ? [nodeShape as NodeGeometryShape]
          : ['rectangle'];
  const pickNodeShape = () => nodeShapePool[Math.floor(Math.random() * nodeShapePool.length)];
  const resolveNodeShape = (configuredShape: NodeGeometryShape) => nodeShape === 'custom'
    ? allNodeShapes.includes(configuredShape) ? configuredShape : 'rectangle'
    : pickNodeShape();
  const radialSidesForShape = (shape: NodeGeometryShape) => shape === 'circle'
    ? 64
    : shape === 'triangle'
      ? 3
      : shape === 'hexagon'
        ? 6
        : undefined;
  const isRadialShape = (shape: NodeGeometryShape) => radialSidesForShape(shape) !== undefined;
  const nodeCornerRadiusPixels = THREE.MathUtils.clamp(nodeCornerRadius, 0, 50);
  const perspectiveAmount = THREE.MathUtils.clamp(perspectiveEffect, 0, 100) / 100;
  const resolvedCameraPitch = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraPitch, 0, 65));
  const resolvedCameraZoom = THREE.MathUtils.clamp(cameraZoom, 0.25, 2);
  let currentCameraZoom = resolvedCameraZoom;
  let targetCameraZoom = resolvedCameraZoom;
  const resolvedConnectorOpacity = THREE.MathUtils.clamp(connectorOpacity, 0, 1);
  const resolvedConnectorWidth = THREE.MathUtils.clamp(connectorWidth, 0, 5);
  const resolvedPathCurve = THREE.MathUtils.clamp(pathCurve, 0, 100) / 100;
  const resolvedOutlineOpacity = THREE.MathUtils.clamp(outlineOpacity, 0, 1);
  const resolvedOutlineWidth = THREE.MathUtils.clamp(outlineWidth, 0, 5);
  const delayMinimum = Math.max(0, Math.min(Math.round(minDelay), Math.round(maxDelay)));
  const delayMaximum = Math.max(0, Math.max(Math.round(minDelay), Math.round(maxDelay)));
  const delaysEnabled = delayMaximum > 0;
  const resolvedSpeed = THREE.MathUtils.clamp(speed, 0.1, 4);
  const resolvedNodeProgressMode: NodeProgressMode = nodeProgressMode === 'outline' ? 'outline' : 'bar';
  const resolvedProgressPadding = THREE.MathUtils.clamp(progressPadding, 0, 3);
  const resolvedProgressBarHeight = THREE.MathUtils.clamp(Math.round(progressBarHeight), 0, 100);
  const beamCount = THREE.MathUtils.clamp(Math.round(concurrentBeams), 1, 10);
  const emitDelayMinimum = Math.max(0, Math.min(Math.round(minEmitDelay), Math.round(maxEmitDelay)));
  const emitDelayMaximum = Math.max(0, Math.max(Math.round(minEmitDelay), Math.round(maxEmitDelay)));
  const hiddenNodeIds = new Set(flow.variants?.[variant]?.hiddenNodes || []);
  const rootNodeId = flow.root;
  const nodes = Object.fromEntries(
    flow.nodes.map((node) => [node.id, {
      p: [...node.position],
      label: node.label,
      svg: node.svg,
      size: node.size,
      tier: node.tier,
      shape: resolveNodeShape(node.shape),
      height: pickNodeHeight(),
    }]),
  ) as Record<string, RuntimeNode>;

  function nodeFootprint(node: RuntimeNode): [number, number] {
    if (node.shape === 'rectangle') return node.size;
    const [width, depth] = node.size;
    if (node.shape === 'square') {
      const side = Math.sqrt(width * depth);
      return [side, side];
    }
    const area = width * depth;
    const radialSides = radialSidesForShape(node.shape);
    const diameter = node.shape === 'circle'
      ? Math.sqrt((4 * area) / Math.PI)
      : 2 * Math.sqrt((2 * area) / (
        (radialSides ?? 3) * Math.sin((Math.PI * 2) / (radialSides ?? 3))
      ));
    return [diameter, diameter];
  }

  const rows = new Map<number, Array<[string, RuntimeNode]>>();
  Object.entries(nodes).forEach(([id, node]) => {
    if (hiddenNodeIds.has(id)) return;
    const row = rows.get(node.tier) || [];
    row.push([id, node]);
    rows.set(node.tier, row);
  });
  rows.forEach((row) => {
    if (row.length < 2) return;
    row.sort(([, left], [, right]) => left.p[0] - right.p[0]);
    const originalLeft = Math.min(...row.map(([, node]) => node.p[0] - nodeFootprint(node)[0] * 0.5));
    const originalRight = Math.max(...row.map(([, node]) => node.p[0] + nodeFootprint(node)[0] * 0.5));
    const rowCenter = (originalLeft + originalRight) * 0.5;
    const occupiedWidth = row.reduce((total, [, node]) => total + nodeFootprint(node)[0], 0);
    const minimumGap = 0.65;
    const rowWidth = Math.max(originalRight - originalLeft, occupiedWidth + minimumGap * (row.length - 1));
    const gap = (rowWidth - occupiedWidth) / (row.length - 1);
    let cursor = rowCenter - rowWidth * 0.5;
    row.forEach(([, node]) => {
      const [nodeWidth] = nodeFootprint(node);
      node.p[0] = cursor + nodeWidth * 0.5;
      cursor += nodeWidth + gap;
    });
  });

  const visibleNodes = Object.entries(nodes).filter(([id]) => !hiddenNodeIds.has(id));
  const flowLeft = Math.min(...visibleNodes.map(([, node]) => node.p[0] - nodeFootprint(node)[0] * 0.5));
  const flowRight = Math.max(...visibleNodes.map(([, node]) => node.p[0] + nodeFootprint(node)[0] * 0.5));
  const flowNear = Math.min(...visibleNodes.map(([, node]) => node.p[1] - nodeFootprint(node)[1] * 0.5));
  const flowFar = Math.max(...visibleNodes.map(([, node]) => node.p[1] + nodeFootprint(node)[1] * 0.5));
  const flowDepth = flowFar - flowNear;
  const desktopCameraBase = Math.max(8.1, flowDepth * 0.5);
  const mobileCameraBase = Math.max(9.8, flowDepth * 0.6);

  const branches = Object.fromEntries(
    Object.entries(flow.branches)
      .filter(([source]) => nodes[source] && !hiddenNodeIds.has(source))
      .map(([source, targets]) => [
        source,
        targets.filter((target) => nodes[target] && !hiddenNodeIds.has(target)),
      ]),
  );

  if (!nodes[rootNodeId] || hiddenNodeIds.has(rootNodeId) || !branches[rootNodeId]?.length) {
    throw new Error('SignalFlowIllustration needs a visible root node with at least one connection.');
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = isVariant2 ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isDark ? 0.88 : 1.05;

  const cssRenderer = new CSS3DRenderer();
  Object.assign(cssRenderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
  });
  cssLayer.replaceChildren(cssRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.background);
  scene.fog = fogEnabled
    ? new THREE.Fog(palette.fog, isDark ? 20 : 22, isDark ? 38 : 39)
    : null;

  const cameraTarget = new THREE.Vector3(
    (flowLeft + flowRight) * 0.5 + 0.3,
    0,
    (flowNear + flowFar) * 0.5 + 1.2,
  );
  const cameraHeading = cameraYaw === undefined
    ? new THREE.Vector3(14 - cameraTarget.x, 0, 18 - cameraTarget.z).normalize()
    : new THREE.Vector3(
      Math.sin(THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraYaw, -180, 180))),
      0,
      Math.cos(THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraYaw, -180, 180))),
    );
  const cameraDirection = new THREE.Vector3(
    cameraHeading.x * Math.cos(resolvedCameraPitch),
    Math.sin(resolvedCameraPitch),
    cameraHeading.z * Math.cos(resolvedCameraPitch),
  );
  const perspectiveFov = THREE.MathUtils.lerp(2, 68, perspectiveAmount);
  const initialCameraBase = container.clientWidth < 760 ? mobileCameraBase : desktopCameraBase;
  const initialVisibleWorldHeight = initialCameraBase * 2 / resolvedCameraZoom;
  const initialPixelsPerWorldUnit = Math.max(container.clientHeight, 1) / initialVisibleWorldHeight;
  const initialPerspectiveDistance = initialCameraBase / Math.tan(THREE.MathUtils.degToRad(perspectiveFov * 0.5));
  const camera: THREE.OrthographicCamera | THREE.PerspectiveCamera = perspectiveAmount === 0
    ? new THREE.OrthographicCamera(-9, 9, 7, -7, 0.1, 100)
    : new THREE.PerspectiveCamera(perspectiveFov, 1, Math.max(0.1, initialPerspectiveDistance - 100), initialPerspectiveDistance + 100);
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.position.copy(cameraTarget).addScaledVector(cameraDirection, initialPerspectiveDistance);
  } else {
    camera.position.copy(cameraTarget).addScaledVector(cameraDirection, 24);
  }
  camera.zoom = currentCameraZoom;
  camera.lookAt(cameraTarget);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(cameraTarget);
  controls.enabled = interactive;
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  if (camera instanceof THREE.PerspectiveCamera) {
    controls.minDistance = initialPerspectiveDistance * 0.8;
    controls.maxDistance = initialPerspectiveDistance * 1.35;
  } else {
    controls.minZoom = 0.8;
    controls.maxZoom = 1.35;
  }
  controls.minPolarAngle = Math.PI * 0.14;
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minAzimuthAngle = -0.25;
  controls.maxAzimuthAngle = 1.42;

  scene.add(new THREE.HemisphereLight(palette.sky, palette.bounce, isDark ? 1.25 : 2.2));
  const key = new THREE.DirectionalLight(palette.key, isDark ? 2.15 : 3.5);
  key.position.set(-7, 14, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(isVariant2 ? 1024 : 2048, isVariant2 ? 1024 : 2048);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = isVariant2 ? 0.025 : 0;
  key.shadow.radius = isVariant2 ? 9 : 1;
  key.shadow.blurSamples = isVariant2 ? 24 : 8;
  scene.add(key);

  const greenLight = new THREE.PointLight(effects.greenLight, isVariant2 ? 0 : 1.6, isVariant2 ? 10 : 7, 2);
  greenLight.position.set(0, 2, 0);
  scene.add(greenLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({
      color: palette.ground,
      roughness: 0.92,
      metalness: 0,
      fog: fogEnabled,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.16;
  scene.add(ground);

  const shadowCatcherMaterial = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: isDark ? 0.42 : 0.24,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    fog: fogEnabled,
  });
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    shadowCatcherMaterial,
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.13;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.renderOrder = -90;
  scene.add(shadowCatcher);

  const resolvedGridOpacity = THREE.MathUtils.clamp(gridOpacity, 0, 1);
  const resolvedGridDensity = Number.isFinite(gridDensity)
    ? THREE.MathUtils.clamp(gridDensity, 8, 160)
    : 30;
  const resolvedGridMaskRadius = Number.isFinite(gridMaskRadius)
    ? THREE.MathUtils.clamp(gridMaskRadius, 0, 1200) / initialPixelsPerWorldUnit
    : 0;
  const resolvedGridMaskBlur = Number.isFinite(gridMaskBlur)
    ? THREE.MathUtils.clamp(gridMaskBlur, 0, 1200) / initialPixelsPerWorldUnit
    : 0;
  const emitterPosition = nodes[rootNodeId].p;
  const networkOffsetX = emitterX - emitterPosition[0];
  const networkOffsetZ = emitterY - emitterPosition[1];
  const gridMaskCenter = new THREE.Vector2(
    (flowLeft + flowRight) * 0.5 + networkOffsetX,
    (flowNear + flowFar) * 0.5 + networkOffsetZ,
  );
  if (resolvedGridOpacity > 0) {
    // Keep the physical grid edge beyond the fog range so it reads as an
    // unbounded tiled plane from every supported camera angle and zoom.
    const gridSize = 200;
    const gridDivisions = THREE.MathUtils.clamp(
      Math.round(gridSize * initialPixelsPerWorldUnit / resolvedGridDensity),
      4,
      1024,
    );
    const gridLayer = new THREE.Group();
    gridLayer.renderOrder = -100;
    const gridTemplate = new THREE.GridHelper(gridSize, gridDivisions, palette.gridMinor, palette.gridMinor);
    const gridMaterials = Array.isArray(gridTemplate.material) ? gridTemplate.material : [gridTemplate.material];
    gridMaterials.forEach((material) => material.dispose());
    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uGridColor: { value: new THREE.Color(palette.gridMinor) },
        uMaskColor: { value: new THREE.Color(0xffffff) },
        uMaskCenter: { value: gridMaskCenter },
        uMaskRadius: { value: resolvedGridMaskRadius },
        uMaskBlur: { value: resolvedGridMaskBlur },
        uOpacity: { value: resolvedGridOpacity },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vec4 mvPosition = viewMatrix * worldPosition;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        varying vec3 vWorldPosition;
        uniform vec3 uGridColor;
        uniform vec3 uMaskColor;
        uniform vec2 uMaskCenter;
        uniform float uMaskRadius;
        uniform float uMaskBlur;
        uniform float uOpacity;
        void main() {
          float distanceFromCenter = distance(vWorldPosition.xz, uMaskCenter);
          float maskEnabled = step(0.0001, uMaskRadius);
          float mask = maskEnabled * (1.0 - smoothstep(
            uMaskRadius,
            uMaskRadius + max(uMaskBlur, 0.0001),
            distanceFromCenter
          ));
          gl_FragColor = vec4(mix(uGridColor, uMaskColor, mask), uOpacity);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      fog: fogEnabled,
    });
    const grid = new THREE.LineSegments(gridTemplate.geometry, gridMaterial);
    grid.position.y = -0.14;
    grid.renderOrder = -100;
    gridLayer.add(grid);
    scene.add(gridLayer);
  }

  const network = new THREE.Group();
  network.position.set(
    networkOffsetX,
    0,
    networkOffsetZ,
  );
  scene.add(network);

  const cardObjects: Record<string, THREE.Group> = {};

  function createCardGradientTexture() {
    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 512;
    gradientCanvas.height = 320;
    const context = gradientCanvas.getContext('2d');
    if (!context) throw new Error('Could not create the node face gradient.');
    const angle = THREE.MathUtils.degToRad(frontGradient.angle);
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const centerX = gradientCanvas.width * 0.5;
    const centerY = gradientCanvas.height * 0.5;
    const extent = Math.abs(directionX) * centerX + Math.abs(directionY) * centerY;
    const gradient = context.createLinearGradient(
      centerX - directionX * extent,
      centerY - directionY * extent,
      centerX + directionX * extent,
      centerY + directionY * extent,
    );
    gradient.addColorStop(0, frontGradient.start);
    gradient.addColorStop(0.48, frontGradient.mid);
    gradient.addColorStop(1, frontGradient.end);
    context.fillStyle = gradient;
    context.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
    const texture = new THREE.CanvasTexture(gradientCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return texture;
  }

  const cardGradientTexture = createCardGradientTexture();

  function createCardSideMaterial(
    height: number,
    width: number,
    depth: number,
    axis: 'x' | 'z',
    reverse: boolean,
    verticalDirection: 'up' | 'down',
    shade: number,
    gradient: ResolvedNodeGradient,
  ) {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uHeight: { value: height },
        uWidth: { value: width },
        uDepth: { value: depth },
        uAxis: { value: axis === 'z' ? 1 : 0 },
        uReverse: { value: reverse ? 1 : 0 },
        uVerticalUp: { value: verticalDirection === 'up' ? 1 : 0 },
        uGradientAngle: { value: THREE.MathUtils.degToRad(gradient.angle) },
        uHighlight: { value: new THREE.Color(gradient.start) },
        uMid: { value: new THREE.Color(gradient.mid) },
        uShadow: { value: new THREE.Color(gradient.end) },
        uShade: { value: shade },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        varying float vHeight;
        varying float vAxis;
        uniform float uHeight;
        uniform float uWidth;
        uniform float uDepth;
        uniform float uAxis;
        uniform float uReverse;
        uniform float uVerticalUp;
        void main() {
          vHeight = clamp(position.y / max(uHeight, .001) + .5, 0.0, 1.0);
          float alongX = position.x / max(uWidth, .001) + .5;
          float alongZ = position.z / max(uDepth, .001) + .5;
          vAxis = clamp(mix(alongX, alongZ, uAxis), 0.0, 1.0);
          vAxis = mix(vAxis, 1.0 - vAxis, uReverse);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        varying float vHeight;
        varying float vAxis;
        uniform vec3 uHighlight;
        uniform vec3 uMid;
        uniform vec3 uShadow;
        uniform float uShade;
        uniform float uVerticalUp;
        uniform float uGradientAngle;
        void main() {
          float verticalLight = mix(1.0 - vHeight, vHeight, uVerticalUp);
          vec2 gradientDirection = vec2(cos(uGradientAngle), sin(uGradientAngle));
          float projectionMinimum = min(gradientDirection.x, 0.0) + min(gradientDirection.y, 0.0);
          float projectionMaximum = max(gradientDirection.x, 0.0) + max(gradientDirection.y, 0.0);
          float projected = dot(vec2(vAxis, verticalLight), gradientDirection);
          float diagonalLight = clamp(
            (projected - projectionMinimum) / max(projectionMaximum - projectionMinimum, .001),
            0.0,
            1.0
          );
          float midBlend = smoothstep(.08, .62, diagonalLight);
          float highlightBlend = smoothstep(.56, .98, diagonalLight);
          vec3 sideColor = mix(uShadow, uMid, midBlend);
          sideColor = mix(sideColor, uHighlight, highlightBlend);
          float verticalShade = mix(.74, 1.0, verticalLight);
          gl_FragColor = vec4(sideColor * verticalShade * uShade, 1.0);
          #include <fog_fragment>
        }
      `,
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  function createNodeOutlineMaterial() {
    return new LineMaterial({
      color: effects.nodeStroke,
      transparent: true,
      opacity: resolvedOutlineOpacity,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -8,
      toneMapped: false,
      alphaToCoverage: false,
      linewidth: Math.max(resolvedOutlineWidth, 0.001),
      fog: fogEnabled,
    });
  }

  function createRadialFaceOutline(radius: number, height: number, sides: number) {
    const outline = new THREE.Group();
    if (resolvedOutlineWidth === 0 || resolvedOutlineOpacity === 0) return outline;
    const points = Array.from({ length: sides + 1 }, (_, index) => {
      const angle = index / sides * Math.PI * 2;
      return new THREE.Vector3(
        Math.sin(angle) * radius,
        height * 0.5 + 0.003,
        Math.cos(angle) * radius,
      );
    });
    const ring = new Line2(
      new LineGeometry().setPositions(points.flatMap((point) => [point.x, point.y, point.z])),
      createNodeOutlineMaterial(),
    );
    ring.renderOrder = 3;
    outline.add(ring);
    return outline;
  }

  function createCardFaceOutlines(geometry: THREE.BufferGeometry) {
    if (resolvedOutlineWidth === 0 || resolvedOutlineOpacity === 0) {
      return new THREE.Group();
    }
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const precision = 1_000_000;
    const vertexKey = (index: number) => [positions.getX(index), positions.getY(index), positions.getZ(index)]
      .map((value) => Math.round(value * precision))
      .join(',');
    type Edge = {
      a: THREE.Vector3;
      b: THREE.Vector3;
      normalA: THREE.Vector3;
      normalB: THREE.Vector3;
      materials: Set<number>;
    };
    const edges = new Map<string, Edge>();

    const addEdge = (firstIndex: number, secondIndex: number, materialIndex: number) => {
      const firstKey = vertexKey(firstIndex);
      const secondKey = vertexKey(secondIndex);
      const [aIndex, bIndex, aKey, bKey] = firstKey < secondKey
        ? [firstIndex, secondIndex, firstKey, secondKey]
        : [secondIndex, firstIndex, secondKey, firstKey];
      const key = `${aKey}|${bKey}`;
      const existing = edges.get(key);
      if (existing) {
        existing.materials.add(materialIndex);
        return;
      }
      edges.set(key, {
        a: new THREE.Vector3().fromBufferAttribute(positions, aIndex),
        b: new THREE.Vector3().fromBufferAttribute(positions, bIndex),
        normalA: new THREE.Vector3().fromBufferAttribute(normals, aIndex),
        normalB: new THREE.Vector3().fromBufferAttribute(normals, bIndex),
        materials: new Set([materialIndex]),
      });
    };

    geometry.groups.forEach((group) => {
      const end = group.start + group.count;
      const materialIndex = group.materialIndex ?? 0;
      for (let index = group.start; index < end; index += 3) {
        addEdge(index, index + 1, materialIndex);
        addEdge(index + 1, index + 2, materialIndex);
        addEdge(index + 2, index, materialIndex);
      }
    });

    const topSeamPoints: THREE.Vector3[] = [];
    const sideSeamPoints: THREE.Vector3[] = [];
    const bottomSeamPoints: THREE.Vector3[] = [];
    const surfaceOffset = 0.002;
    edges.forEach((edge) => {
      if (edge.materials.size < 2) return;
      const seamPoints = edge.materials.has(3)
        ? bottomSeamPoints
        : edge.materials.has(2)
          ? topSeamPoints
          : sideSeamPoints;
      seamPoints.push(
        edge.a.clone().addScaledVector(edge.normalA, surfaceOffset),
        edge.b.clone().addScaledVector(edge.normalB, surfaceOffset),
      );
    });
    const outlines = new THREE.Group();
    [topSeamPoints, sideSeamPoints, bottomSeamPoints].forEach((points) => {
      const seamPoints = points as THREE.Vector3[];
      if (seamPoints.length === 0) return;
      const linePositions = seamPoints.flatMap((point) => [point.x, point.y, point.z]);
      const segments = new LineSegments2(
        new LineSegmentsGeometry().setPositions(linePositions),
        createNodeOutlineMaterial(),
      );
      segments.renderOrder = 3;
      outlines.add(segments);
    });
    return outlines;
  }

  const baseIconOpacity = THREE.MathUtils.clamp(nodeIconOpacity, 0, 1);

  function nodeProgressOutlineMetrics(
    width: number,
    depth: number,
    shape: NodeGeometryShape,
  ) {
    const radialSides = radialSidesForShape(shape);
    const isRadial = radialSides !== undefined;
    const viewportWidth = isRadial ? 300 : 512;
    const viewportHeight = 300;
    const defaultInset = Math.min(
      viewportHeight * 0.24,
      Math.max(16, resolvedProgressBarHeight * 0.65 + 6),
    );
    const inset = Math.min(
      viewportHeight * 0.485,
      defaultInset * resolvedProgressPadding,
    );
    return {
      radialSides,
      viewportWidth,
      viewportHeight,
      inset,
      worldScaleX: width * (isRadial ? 0.9 / 300 : 0.94 / 512),
      worldScaleZ: depth * 0.9 / 300,
    };
  }

  function nodeFaceObject(
    asset: string,
    width: number,
    depth: number,
    height: number,
    shape: NodeGeometryShape,
  ) {
    const imageUrl = `${assetBasePath.replace(/\/$/, '')}/${asset}`;
    const {
      viewportWidth,
      viewportHeight,
      inset,
      worldScaleX,
      worldScaleZ,
    } = nodeProgressOutlineMetrics(width, depth, shape);
    const iconPadding = 6;
    const availableWidth = Math.max(
      1,
      (viewportWidth - (inset + iconPadding) * 2) * worldScaleX,
    );
    const availableDepth = Math.max(
      1,
      (viewportHeight - (inset + iconPadding) * 2) * worldScaleZ,
    );
    const shapeArtworkScale = shape === 'circle'
      ? 0.512
      : shape === 'rectangle'
        ? 0.8
        : shape === 'triangle'
          ? 0.82 / (Math.sqrt(3) + 1)
          : shape === 'hexagon'
            ? (Math.sqrt(3) * 0.8) / (Math.sqrt(3) + 1)
            : 1;
    const uniformScale = Math.min(
      availableWidth / viewportWidth,
      availableDepth / viewportHeight,
    ) * shapeArtworkScale;
    const image = document.createElement('div');
    image.setAttribute('aria-hidden', 'true');
    Object.assign(image.style, {
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
      opacity: String(baseIconOpacity),
      backgroundColor: palette.icon,
      maskImage: `url("${imageUrl}")`,
      maskSize: 'contain',
      maskPosition: 'center',
      maskRepeat: 'no-repeat',
      WebkitMaskImage: `url("${imageUrl}")`,
      WebkitMaskSize: 'contain',
      WebkitMaskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      pointerEvents: 'none',
      userSelect: 'none',
      backfaceVisibility: 'hidden',
    });

    void loadSvgAssetMarkup(imageUrl).then((markup) => {
      const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const svg = parsed.documentElement as unknown as SVGSVGElement;
      if (svg.namespaceURI !== 'http://www.w3.org/2000/svg' || svg.localName !== 'svg') {
        throw new Error(`Invalid SVG asset: ${imageUrl}`);
      }

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('shape-rendering', 'geometricPrecision');
      svg.setAttribute('focusable', 'false');
      Object.assign(svg.style, {
        display: 'block',
        width: '100%',
        height: '100%',
        color: palette.icon,
        overflow: 'visible',
      });

      svg.querySelectorAll<SVGElement>('[stroke]').forEach((element) => {
        if (element.getAttribute('stroke') !== 'none') {
          element.setAttribute('stroke', 'currentColor');
        }
        element.setAttribute('shape-rendering', 'geometricPrecision');
      });
      svg.querySelectorAll<SVGElement>('[fill]').forEach((element) => {
        if (element.getAttribute('fill') !== 'none') {
          element.setAttribute('fill', 'currentColor');
        }
      });

      image.style.backgroundColor = 'transparent';
      image.style.maskImage = 'none';
      image.style.setProperty('-webkit-mask-image', 'none');
      image.replaceChildren(svg);
    }).catch(() => {
      // Keep the CSS mask fallback when the source cannot be inlined.
    });

    const face = new CSS3DObject(image);
    face.rotation.x = -Math.PI / 2;
    face.position.y = height * 0.5 + 0.009;
    face.scale.set(uniformScale, uniformScale, 1);
    return face;
  }

  function nodeProgressObject(
    width: number,
    depth: number,
    height: number,
    shape: NodeGeometryShape,
  ): NodeProgressControl {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    Object.assign(container.style, {
      opacity: '0',
      transition: 'opacity 120ms ease-out',
      pointerEvents: 'none',
      backfaceVisibility: 'hidden',
    });

    if (resolvedNodeProgressMode === 'bar') {
      Object.assign(container.style, {
        width: '240px',
        height: `${resolvedProgressBarHeight}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      });
      const track = document.createElement('div');
      Object.assign(track.style, {
        width: '100%',
        height: `${resolvedProgressBarHeight}px`,
        flex: '0 0 auto',
        overflow: 'hidden',
        borderRadius: '999px',
        backgroundColor: effects.nodeProgressTrack,
        opacity: '0',
        transition: 'opacity 100ms ease-out',
      });
      const fill = document.createElement('div');
      Object.assign(fill.style, {
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        backgroundColor: effects.nodeProgressFill,
        transform: 'scaleX(0)',
        transformOrigin: 'left center',
        willChange: 'transform',
      });
      track.append(fill);
      container.append(track);

      const object = new CSS3DObject(container);
      object.rotation.x = -Math.PI / 2;
      const edgeInset = THREE.MathUtils.clamp(0.19 * resolvedProgressPadding, 0, 0.44);
      const sideInset = THREE.MathUtils.clamp(0.21 * resolvedProgressPadding, 0, 0.46);
      object.position.set(0, height * 0.5 + 0.012, depth * (0.5 - edgeInset));
      object.scale.set(width * (1 - sideInset * 2) / 240, depth * 0.055 / 8, 1);
      return {
        object,
        setProgress(progress) {
          const visible = resolvedProgressBarHeight > 0 && progress !== undefined;
          container.style.opacity = visible ? '1' : '0';
          track.style.opacity = visible ? '1' : '0';
          fill.style.transform = `scaleX(${progress ?? 0})`;
        },
      };
    }

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const {
      radialSides,
      viewportWidth,
      viewportHeight,
      inset,
      worldScaleX,
      worldScaleZ,
    } = nodeProgressOutlineMetrics(width, depth, shape);
    Object.assign(container.style, {
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
    });
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', `0 0 ${viewportWidth} ${viewportHeight}`);
    svg.setAttribute('width', String(viewportWidth));
    svg.setAttribute('height', String(viewportHeight));
    svg.style.overflow = 'visible';

    const createPath = () => {
      if (shape === 'circle') {
        const circle = document.createElementNS(svgNamespace, 'circle');
        circle.setAttribute('cx', '150');
        circle.setAttribute('cy', '150');
        circle.setAttribute('r', String(150 - inset));
        circle.setAttribute('transform', 'rotate(-90 150 150)');
        return circle;
      }
      if (radialSides !== undefined) {
        const polygon = document.createElementNS(svgNamespace, 'polygon');
        const radius = 150 - inset;
        const points = Array.from({ length: radialSides }, (_, index) => {
          const angle = -index / radialSides * Math.PI * 2;
          return `${150 + Math.sin(angle) * radius},${150 + Math.cos(angle) * radius}`;
        });
        polygon.setAttribute('points', points.join(' '));
        return polygon;
      }
      const rectangle = document.createElementNS(svgNamespace, 'rect');
      rectangle.setAttribute('x', String(inset));
      rectangle.setAttribute('y', String(inset));
      rectangle.setAttribute('width', String(viewportWidth - inset * 2));
      rectangle.setAttribute('height', String(viewportHeight - inset * 2));
      rectangle.setAttribute('rx', String(Math.min(
        viewportHeight * 0.18,
        Math.max(4, nodeCornerRadiusPixels * 1.8),
      )));
      return rectangle;
    };
    const track = createPath();
    const fill = createPath();
    [track, fill].forEach((path) => {
      path.setAttribute('fill', 'none');
      path.setAttribute('pathLength', '1');
      path.setAttribute('stroke-width', String(resolvedProgressBarHeight));
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    });
    track.setAttribute('stroke', effects.nodeProgressTrack);
    fill.setAttribute('stroke', effects.nodeProgressFill);
    fill.style.strokeDasharray = '1';
    fill.style.strokeDashoffset = '1';
    fill.style.willChange = 'stroke-dashoffset';
    svg.append(track, fill);
    container.append(svg);

    const object = new CSS3DObject(container);
    object.rotation.x = -Math.PI / 2;
    object.position.set(0, height * 0.5 + 0.014, 0);
    object.scale.set(worldScaleX, worldScaleZ, 1);
    return {
      object,
      setProgress(progress) {
        const visible = resolvedProgressBarHeight > 0 && progress !== undefined;
        container.style.opacity = visible ? '1' : '0';
        svg.style.opacity = visible ? '1' : '0';
        fill.style.strokeDashoffset = String(1 - (progress ?? 0));
      },
    };
  }

  function createNodeGlowMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uIntensity: { value: 0 },
        uColor: { value: new THREE.Color(effects.nodeGlow) },
        uAlpha: { value: isDark ? 0.68 : 0.44 },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        varying vec2 vUv;
        uniform float uIntensity;
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() {
          vec2 p = (vUv - .5) * 2.0;
          float radius = length(p);
          float innerLight = exp(-radius * radius * 3.4);
          float atmosphere = exp(-radius * radius * 1.45);
          float edgeFade = 1.0 - smoothstep(.42, 1.0, radius);
          float glow = (innerLight * .28 + atmosphere * .72) * edgeFade;
          float alpha = glow * uIntensity * uAlpha;
          if (alpha < .004) discard;
          gl_FragColor = vec4(uColor * (1.0 + uIntensity * .4), alpha);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  function createCard(id: string, data: RuntimeNode) {
    const [width, cardDepth] = nodeFootprint(data);
    const nodeHeight = data.height;
    const radialSides = radialSidesForShape(data.shape);
    const isRadial = radialSides !== undefined;
    const group = new THREE.Group();
    const baseBottom = (isVariant2 ? 0.4 : 0.28) - 0.11 + data.tier * 0.03;
    group.position.set(data.p[0], baseBottom + nodeHeight * 0.5, data.p[1]);
    group.scale.setScalar(resolvedNodeScale);

    const nodeGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 1.72, cardDepth * 1.92),
      createNodeGlowMaterial(),
    );
    nodeGlow.rotation.x = -Math.PI / 2;
    nodeGlow.position.y = nodeHeight * 0.5 - 0.015;
    nodeGlow.renderOrder = 1;
    group.add(nodeGlow);

    const faceMaterial = new THREE.MeshBasicMaterial({
      map: cardGradientTexture,
      toneMapped: false,
      fog: fogEnabled,
    });
    const rightSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'z', false, 'up', 1, sideZGradient);
    const leftSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'z', true, 'down', isDark ? 0.78 : 0.88, sideZGradient);
    const frontSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'x', false, 'down', isDark ? 0.96 : 0.96, sideXGradient);
    const backSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'x', true, 'up', isDark ? 0.74 : 0.84, sideXGradient);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: palette.cardShadow,
      roughness: 0.66,
      metalness: 0.02,
      fog: fogEnabled,
    });
    const bodyRadius = Math.min(
      nodeCornerRadiusPixels * 0.01,
      nodeHeight * 0.45,
      width * 0.45,
      cardDepth * 0.45,
    );
    const bodyGeometry = isRadial
      ? new THREE.CylinderGeometry(width * 0.5, width * 0.5, nodeHeight, radialSides, 1, false)
      : new RoundedBoxGeometry(width, nodeHeight, cardDepth, 3, bodyRadius);
    const bodyMaterials = isRadial
      ? [frontSideMaterial, faceMaterial, bottomMaterial]
      : [rightSideMaterial, leftSideMaterial, faceMaterial, bottomMaterial, frontSideMaterial, backSideMaterial];
    const body = new THREE.Mesh(
      bodyGeometry,
      bodyMaterials,
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    group.add(isRadial
      ? createRadialFaceOutline(width * 0.5, nodeHeight, radialSides)
      : createCardFaceOutlines(bodyGeometry));
    const nodeFace = nodeFaceObject(data.svg, width, cardDepth, nodeHeight, data.shape);
    group.add(nodeFace);
    const nodeProgress = nodeProgressObject(width, cardDepth, nodeHeight, data.shape);
    group.add(nodeProgress.object);

    const glowState: NodeGlowState = {
      value: 0,
      phase: 'idle',
      startedAt: 0,
      armed: true,
    };
    group.userData = {
      id,
      body,
      nodeFace,
      nodeGlow,
      glowState,
      nodeProgressControl: nodeProgress,
      baseY: group.position.y,
    };
    cardObjects[id] = group;
    network.add(group);
  }

  Object.entries(nodes).forEach(([id, data]) => {
    if (!hiddenNodeIds.has(id)) createCard(id, data);
  });

  const connectorLift = 0.06;

  function edgePoints(a: string, b: string, lift = connectorLift) {
    const pointA = nodes[a].p;
    const pointB = nodes[b].p;
    const y = 0.05 + lift;
    const midZ = (pointA[1] + pointB[1]) * 0.5;
    return [
      new THREE.Vector3(pointA[0], y, pointA[1]),
      new THREE.Vector3(pointA[0], y, midZ),
      new THREE.Vector3(pointB[0], y, midZ),
      new THREE.Vector3(pointB[0], y, pointB[1]),
    ];
  }

  function makeCurve(points: THREE.Vector3[]) {
    if (isVariant2) {
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 0; i < points.length - 1; i++) {
        path.add(new THREE.LineCurve3(points[i], points[i + 1]));
      }
      return path;
    }
    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.15);
  }

  function sharedPathPoints(points: THREE.Vector3[]) {
    return roundedPolylinePoints(points, resolvedPathCurve);
  }

  function createConnectorLineMaterial(dashed: boolean, opacity = resolvedConnectorOpacity) {
    return new LineMaterial({
      color: effects.nodeStroke,
      transparent: true,
      opacity,
      linewidth: resolvedConnectorWidth,
      depthWrite: false,
      depthTest: true,
      dashed,
      dashSize: 0.18,
      gapSize: 0.11,
      alphaToCoverage: true,
      side: THREE.DoubleSide,
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  function createConnectorDotsMaterial(opacity = resolvedConnectorOpacity) {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uColor: { value: new THREE.Color(effects.nodeStroke) },
        uOpacity: { value: opacity },
        uPointSize: { value: resolvedConnectorWidth },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        uniform float uPointSize;
        void main() {
          gl_PointSize = uPointSize;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          float coverage = 1.0 - smoothstep(0.38, 0.5, distanceFromCenter);
          if (coverage < 0.01) discard;
          gl_FragColor = vec4(uColor, coverage * uOpacity);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  function createConnectorObject(
    points: THREE.Vector3[],
    curve: THREE.Curve<THREE.Vector3>,
    opacity = resolvedConnectorOpacity,
  ) {
    const connector = new THREE.Group();
    connector.renderOrder = -50;
    if (resolvedConnectorWidth === 0 || opacity === 0) return connector;

    if (connectorStroke === 'solid' || connectorStroke === 'dashed') {
      const line = new Line2(
        new LineGeometry().setPositions(points.flatMap((point) => [point.x, point.y, point.z])),
        createConnectorLineMaterial(connectorStroke === 'dashed', opacity),
      );
      if (connectorStroke === 'dashed') line.computeLineDistances();
      line.frustumCulled = false;
      connector.add(line);
      return connector;
    }

    const pathLength = curve.getLength();
    const dotSpacing = 0.15;
    const dotPositions: THREE.Vector3[] = [];
    for (let distance = dotSpacing * 0.5; distance < pathLength; distance += dotSpacing) {
      dotPositions.push(curve.getPointAt(distance / pathLength));
    }
    const dots = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(dotPositions),
      createConnectorDotsMaterial(opacity),
    );
    dots.frustumCulled = false;
    connector.add(dots);
    return connector;
  }

  function createFadingConnectorObject(points: THREE.Vector3[]) {
    const connector = new THREE.Group();
    connector.renderOrder = -50;
    const curve = makeCurve(points);
    const segmentCount = 12;
    for (let index = 0; index < segmentCount; index++) {
      const start = curve.getPointAt(index / segmentCount);
      const end = curve.getPointAt((index + 1) / segmentCount);
      const opacity = resolvedConnectorOpacity * (index + 0.5) / segmentCount;
      connector.add(createConnectorObject(
        [start, end],
        new THREE.LineCurve3(start, end),
        opacity,
      ));
    }
    return connector;
  }

  Object.entries(branches).forEach(([source, targets]) => targets.forEach((target) => {
    const points = sharedPathPoints(edgePoints(source, target));
    const curve = makeCurve(points);
    const connector = createConnectorObject(points, curve);
    network.add(connector);
    if (!isVariant2) {
      const start = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 8),
        new THREE.MeshBasicMaterial({ color: palette.junction, fog: fogEnabled }),
      );
      start.position.copy(curve.getPoint(0.54));
      network.add(start);
    }
  }));

  const continuationY = 0.05 + connectorLift;
  const continuationDistance = Math.max(initialCameraBase * 2.2, 16);
  const incomingFadeDistance = 100 / initialPixelsPerWorldUnit;
  const [, rootDepth] = nodeFootprint(nodes[rootNodeId]);
  const incomingOriginX = nodes[rootNodeId].p[0];
  const incomingOriginZ = nodes[rootNodeId].p[1] - rootDepth * 0.5 - incomingFadeDistance;
  const incomingPoints = [
    new THREE.Vector3(incomingOriginX, continuationY, incomingOriginZ),
    new THREE.Vector3(nodes[rootNodeId].p[0], continuationY, incomingOriginZ),
  ];
  if (showContinuationConnectors) {
    network.add(createFadingConnectorObject(incomingPoints));
  }

  const terminalTier = Math.max(...visibleNodes.map(([, node]) => node.tier));
  const terminalEndZ = flowFar + continuationDistance;
  if (showContinuationConnectors) {
    visibleNodes
      .filter(([, node]) => node.tier === terminalTier)
      .forEach(([, node]) => {
        const points = [
          new THREE.Vector3(node.p[0], continuationY, node.p[1]),
          new THREE.Vector3(node.p[0], continuationY, terminalEndZ),
        ];
        const curve = makeCurve(points);
        network.add(createConnectorObject(points, curve));
      });
  }

  function beamMaterial(uniforms: BeamUniforms, opacity: number, brightness: number, softness = 0) {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uProgress: uniforms.uProgress,
        uTime: uniforms.uTime,
        uColor: uniforms.uColor,
        uVisibility: uniforms.uVisibility,
        uStartFade: uniforms.uStartFade,
        uHighlight: { value: new THREE.Color(effects.beamHighlight) },
        uOpacity: { value: opacity },
        uBrightness: { value: brightness },
        uSoftness: { value: softness },
        uRibbon: { value: isVariant2 ? 1 : 0 },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        uniform float uProgress;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uVisibility;
        uniform float uStartFade;
        uniform vec3 uHighlight;
        uniform float uOpacity;
        uniform float uBrightness;
        uniform float uSoftness;
        uniform float uRibbon;
        void main() {
          float delta = uProgress - vUv.x;
          float gate = smoothstep(-.018, .008, delta);
          float trail = (1.0 - smoothstep(0.0, .38, delta)) * gate;
          float head = exp(-pow((vUv.x - uProgress) / mix(.022, .07, uSoftness), 2.0));
          float shimmer = .88 + .12 * sin(vUv.x * 190.0 - uTime * 12.0);
          float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 2.2);
          float tubeSurface = mix(.82 + .18 * fresnel, .20 + .80 * fresnel, uSoftness);
          float edgeDistance = abs(vUv.y * 2.0 - 1.0);
          float lateral = clamp(1.0 - edgeDistance, 0.0, 1.0);
          float coreSurface = pow(lateral, .55);
          float feather = 1.0 - smoothstep(.68, 1.0, edgeDistance);
          float gaussianSurface = exp(-pow(edgeDistance * 2.15, 2.0)) * feather;
          float ribbonSurface = mix(coreSurface, gaussianSurface, uSoftness);
          float surface = mix(tubeSurface, ribbonSurface, uRibbon);
          float startFade = smoothstep(0.0, max(uStartFade, .0001), vUv.x);
          float alpha = (trail * (.52 + .18 * shimmer) + head * 1.32) * surface * uOpacity * uVisibility * startFade;
          vec3 shine = mix(uColor, uHighlight, clamp(head * 1.4, 0.0, 1.0));
          shine += uColor * fresnel * uSoftness * .32;
          if (alpha < .004) discard;
          gl_FragColor = vec4(shine * uBrightness, alpha);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: isVariant2 ? THREE.NormalBlending : (isDark ? THREE.AdditiveBlending : THREE.NormalBlending),
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  function beamDiscGlowMaterial(uniforms: BeamUniforms, opacity: number, brightness: number) {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uProgress: uniforms.uProgress,
        uColor: uniforms.uColor,
        uVisibility: uniforms.uVisibility,
        uStartFade: uniforms.uStartFade,
        uHighlight: { value: new THREE.Color(effects.beamHighlight) },
        uOpacity: { value: opacity },
        uBrightness: { value: brightness },
      },
      vertexShader: `
        #include <fog_pars_vertex>
        attribute float aPathProgress;
        varying vec2 vUv;
        varying float vPathProgress;
        void main() {
          vUv = uv;
          vPathProgress = aPathProgress;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        varying vec2 vUv;
        varying float vPathProgress;
        uniform float uProgress;
        uniform vec3 uColor;
        uniform float uVisibility;
        uniform float uStartFade;
        uniform vec3 uHighlight;
        uniform float uOpacity;
        uniform float uBrightness;
        void main() {
          float delta = uProgress - vPathProgress;
          float gate = smoothstep(-.018, .008, delta);
          float trail = (1.0 - smoothstep(0.0, .38, delta)) * gate;
          float head = exp(-pow((vPathProgress - uProgress) / .055, 2.0));
          float radialDistance = length(vUv - vec2(0.5)) * 2.0;
          float radial = exp(-pow(radialDistance * 1.5, 2.0));
          radial *= 1.0 - smoothstep(.72, 1.0, radialDistance);
          float startFade = smoothstep(0.0, max(uStartFade, .0001), vPathProgress);
          float alpha = (trail * .5 + head) * radial * uOpacity * uVisibility * startFade;
          if (alpha < .002) discard;
          vec3 shine = mix(uColor, uHighlight, clamp(head * 1.2, 0.0, 1.0));
          gl_FragColor = vec4(shine * uBrightness, alpha);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      toneMapped: false,
      fog: fogEnabled,
    });
  }

  const packetHaloOpacity = isVariant2 ? 0.24 : 0.17;
  function flareTexture() {
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 256;
    flareCanvas.height = 256;
    const context = flareCanvas.getContext('2d');
    if (!context) throw new Error('Could not create the signal flare texture.');
    const glow = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    glow.addColorStop(0, effects.flareStops[0]);
    glow.addColorStop(0.07, effects.flareStops[1]);
    glow.addColorStop(0.2, effects.flareStops[2]);
    glow.addColorStop(0.52, effects.flareStops[3]);
    glow.addColorStop(1, effects.flareStops[4]);
    context.fillStyle = glow;
    context.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(flareCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const packetFlareOpacity = isVariant2 ? (isDark ? 0.92 : 0.58) : (isDark ? 0.5 : 0.38);
  const sharedFlareTexture = flareTexture();

  function createBeamVisual(): BeamVisual {
    const uniforms: BeamUniforms = {
      uProgress: { value: -0.08 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(effects.beam) },
      uVisibility: { value: 0 },
      uStartFade: { value: 0 },
    };
    const starterCurve = new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));
    const core: BeamVisual['core'] = new THREE.Mesh(
      new THREE.TubeGeometry(starterCurve, 4, isVariant2 ? 0.052 : 0.075, isVariant2 ? 12 : 8),
      beamMaterial(uniforms, 1, isVariant2 ? (isDark ? 1.7 : 1) : (isDark ? 0.92 : 0.72), 0.05),
    );
    const glow: BeamVisual['glow'] = new THREE.Mesh(
      isVariant2 ? new THREE.BufferGeometry() : new THREE.TubeGeometry(starterCurve, 4, 0.22, 8),
      isVariant2
        ? beamDiscGlowMaterial(uniforms, isDark ? 0.045 : 0.032, isDark ? 1.55 : 0.9)
        : beamMaterial(uniforms, 0.28, isDark ? 1.45 : 0.82, 0.52),
    );
    const aura: BeamVisual['aura'] = new THREE.Mesh(
      isVariant2 ? new THREE.BufferGeometry() : new THREE.TubeGeometry(starterCurve, 4, 0.38, 12),
      isVariant2
        ? beamDiscGlowMaterial(uniforms, isDark ? 0.012 : 0.008, isDark ? 1.05 : 0.62)
        : beamMaterial(uniforms, 0, 0, 1),
    );
    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(isVariant2 ? 0.085 : 0.105, 24, 16),
      new THREE.MeshBasicMaterial({
        color: effects.packetCore,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        toneMapped: false,
        fog: fogEnabled,
      }),
    );
    const packetHalo = new THREE.Mesh(
      new THREE.SphereGeometry(isVariant2 ? 0.32 : 0.28, 24, 16),
      new THREE.MeshBasicMaterial({
        color: effects.packetHalo,
        transparent: true,
        opacity: packetHaloOpacity,
        blending: isVariant2 ? THREE.NormalBlending : (isDark ? THREE.AdditiveBlending : THREE.NormalBlending),
        depthWrite: false,
        toneMapped: false,
        fog: fogEnabled,
      }),
    );
    const packetFlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sharedFlareTexture,
      color: effects.flare,
      transparent: true,
      opacity: packetFlareOpacity,
      blending: isVariant2 ? THREE.NormalBlending : (isDark ? THREE.AdditiveBlending : THREE.NormalBlending),
      depthWrite: false,
      toneMapped: false,
      fog: fogEnabled,
    }));
    packetFlare.scale.setScalar(isVariant2 ? 1.35 : 0.8);
    const visual = { uniforms, core, glow, aura, packet, packetHalo, packetFlare };
    [aura, glow, core, packetHalo, packet, packetFlare].forEach((object) => {
      object.visible = false;
      network.add(object);
    });
    return visual;
  }

  const duration = reducedMotion ? 8000 : 4300;
  let lastLeaf = '';

  const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

  function pickRoute() {
    let route: string[] = [];
    for (let attempt = 0; attempt < 8; attempt++) {
      route = [rootNodeId];
      const visited = new Set(route);
      let current = rootNodeId;
      while (branches[current]?.length) {
        const candidates = branches[current].filter((id) => !visited.has(id));
        if (!candidates.length) break;
        current = randomItem(candidates);
        route.push(current);
        visited.add(current);
      }
      if (route.at(-1) !== lastLeaf || attempt === 7) break;
    }
    lastLeaf = route.at(-1) || '';
    return route;
  }

  function routePoints(route: string[]) {
    const root = nodes[route[0]];
    const rootPoint = new THREE.Vector3(root.p[0], continuationY, root.p[1]);
    const all: THREE.Vector3[] = showContinuationConnectors
      ? [new THREE.Vector3(incomingOriginX, continuationY, incomingOriginZ), rootPoint]
      : [rootPoint];
    for (let i = 0; i < route.length - 1; i++) {
      const points = edgePoints(route[i], route[i + 1]);
      points.shift();
      all.push(...points);
    }
    if (showContinuationConnectors) {
      const terminal = nodes[route.at(-1) || route[0]];
      all.push(new THREE.Vector3(terminal.p[0], continuationY, terminalEndZ));
    }
    return all;
  }

  function randomDelay(minimum: number, maximum: number) {
    return minimum === maximum
      ? minimum
      : Math.round(THREE.MathUtils.lerp(minimum, maximum, Math.random()));
  }

  function setBeamVisible(run: BeamRun, visible: boolean) {
    const { core, glow, aura, packet, packetHalo, packetFlare } = run.visual;
    [core, glow, aura, packet, packetHalo, packetFlare].forEach((object) => { object.visible = visible; });
  }

  function startBeam(run: BeamRun, startedAt: number) {
    run.route = pickRoute();
    run.startedAt = startedAt;
    run.active = true;
    run.progress = 0;
    run.activeStop = undefined;
    run.activeStopProgress = 0;
    run.visual.uniforms.uProgress.value = -0.08;
    run.visual.uniforms.uVisibility.value = 0;
    const pathPoints = sharedPathPoints(routePoints(run.route));
    run.curve = makeCurve(pathPoints);
    run.visual.uniforms.uStartFade.value = showContinuationConnectors
      ? Math.min(incomingFadeDistance / run.curve.getLength(), 1)
      : 0;
    let accumulatedDelay = 0;
    run.stops = delaysEnabled ? run.route.map((id) => {
      let curveProgress = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (let sample = 0; sample <= 320; sample++) {
        const candidateProgress = sample / 320;
        const candidate = run.curve.getPointAt(candidateProgress);
        const dx = candidate.x - nodes[id].p[0];
        const dz = candidate.z - nodes[id].p[1];
        const distance = dx * dx + dz * dz;
        if (distance < closestDistance) {
          closestDistance = distance;
          curveProgress = candidateProgress;
        }
      }
      const travelProgress = inverseSmootherstep(curveProgress);
      const delay = id === rootNodeId ? 0 : randomDelay(delayMinimum, delayMaximum);
      const arrivalTime = travelProgress * duration + accumulatedDelay;
      const stop = {
        id,
        curveProgress,
        travelProgress,
        delay,
        arrivalTime,
        endTime: arrivalTime + delay,
      };
      accumulatedDelay += delay;
      return stop;
    }) : [];
    run.routeDuration = duration + accumulatedDelay;
    run.visual.core.geometry.dispose();
    run.visual.glow.geometry.dispose();
    run.visual.aura.geometry.dispose();
    if (isVariant2) {
      run.visual.core.geometry = makeRibbonGeometry(pathPoints, 0.055, 0.002);
      run.visual.glow.geometry = makeGlowDiscTrailGeometry(pathPoints, 0.24, 0.055, 0.001);
      run.visual.aura.geometry = makeGlowDiscTrailGeometry(pathPoints, 0.62, 0.15, 0);
    } else {
      run.visual.core.geometry = new THREE.TubeGeometry(run.curve, 150, 0.075, 8, false);
      run.visual.glow.geometry = new THREE.TubeGeometry(run.curve, 150, 0.22, 8, false);
      run.visual.aura.geometry = new THREE.TubeGeometry(run.curve, 150, 0.25, 8, false);
    }
    setBeamVisible(run, true);
  }

  function pulseVisibilityAt(position: THREE.Vector3, route: string[]) {
    if (!isVariant2) return 1;
    let visibility = 1;
    for (const id of route) {
      const node = nodes[id];
      const [width, depth] = nodeFootprint(node);
      const distance = isRadialShape(node.shape)
        ? Math.max(Math.hypot(position.x - node.p[0], position.z - node.p[1]) - width * 0.5, 0)
        : Math.hypot(
            Math.max(Math.abs(position.x - node.p[0]) - width * 0.5, 0),
            Math.max(Math.abs(position.z - node.p[1]) - depth * 0.5, 0),
          );
      visibility = Math.min(visibility, THREE.MathUtils.smoothstep(distance, 0.06, 0.48));
    }
    return visibility;
  }

  const placeholderCurve = new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));
  const beams: BeamRun[] = Array.from({ length: beamCount }, (_, index) => ({
    index,
    route: [],
    curve: placeholderCurve,
    stops: [],
    routeDuration: duration,
    startedAt: 0,
    scheduledAt: 0,
    active: false,
    progress: 0,
    position: new THREE.Vector3(),
    activeStop: undefined,
    activeStopProgress: 0,
    visual: createBeamVisual(),
  }));
  const nodeProgressBatches = new Map<string, Map<number, number>>();

  function resetBeams() {
    const now = performance.now() * resolvedSpeed;
    let scheduledAt = now;
    beams.forEach((run, index) => {
      run.active = false;
      setBeamVisible(run, false);
      if (index > 0) scheduledAt += randomDelay(emitDelayMinimum, emitDelayMaximum);
      run.scheduledAt = scheduledAt;
    });
    nodeProgressBatches.clear();
    Object.values(cardObjects).forEach((card) => {
      const nodeGlow = card.userData.nodeGlow as THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
      const glowState = card.userData.glowState as NodeGlowState;
      const nodeProgressControl = card.userData.nodeProgressControl as NodeProgressControl;
      glowState.value = 0;
      glowState.phase = 'idle';
      glowState.startedAt = 0;
      glowState.armed = true;
      nodeGlow.material.uniforms.uIntensity.value = 0;
      nodeProgressControl.setProgress(undefined);
    });
  }

  resetBeams();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(9, 9);
  const pointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };
  if (interactive) canvas.addEventListener('pointermove', pointerMove);

  const clock = new THREE.Clock();
  const iconWorldPosition = new THREE.Vector3();
  let frameId = 0;
  let destroyed = false;

  function animate(frameNow: number) {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
    const now = frameNow * resolvedSpeed;
    const time = clock.getElapsedTime() * resolvedSpeed;
    const nearNodeIds = new Set<string>();
    const activeNodeRuns = new Map<string, Set<number>>();
    let lightPosition: THREE.Vector3 | undefined;

    beams.forEach((run) => {
      if (!run.active && now >= run.scheduledAt) startBeam(run, now);
      if (!run.active) return;

      const elapsed = now - run.startedAt;
      const travelEnd = delaysEnabled ? run.routeDuration : duration;
      const fadeInDuration = reducedMotion ? 560 : 320;
      const fadeOutDuration = duration * 0.12;
      const resetAfter = travelEnd + fadeOutDuration;
      if (elapsed > resetAfter) {
        run.active = false;
        run.visual.uniforms.uVisibility.value = 0;
        setBeamVisible(run, false);
        run.scheduledAt = now + randomDelay(emitDelayMinimum, emitDelayMaximum);
        return;
      }

      const fadeIn = THREE.MathUtils.smootherstep(THREE.MathUtils.clamp(elapsed / fadeInDuration, 0, 1), 0, 1);
      const fadeOut = elapsed <= travelEnd
        ? 1
        : 1 - THREE.MathUtils.smootherstep(THREE.MathUtils.clamp((elapsed - travelEnd) / fadeOutDuration, 0, 1), 0, 1);
      const runVisibility = fadeIn * fadeOut;

      run.activeStop = undefined;
      run.activeStopProgress = 0;
      let progress = elapsed / duration;
      if (delaysEnabled) {
        let completedDelay = 0;
        for (const stop of run.stops) {
          if (stop.delay > 0 && elapsed >= stop.arrivalTime && elapsed < stop.endTime) {
            run.activeStop = stop;
            run.activeStopProgress = THREE.MathUtils.clamp((elapsed - stop.arrivalTime) / stop.delay, 0, 1);
            break;
          }
          if (elapsed >= stop.endTime) completedDelay += stop.delay;
        }
        progress = run.activeStop
          ? run.activeStop.travelProgress
          : (elapsed - completedDelay) / duration;
      }

      const eased = THREE.MathUtils.smootherstep(THREE.MathUtils.clamp(progress, 0, 1), 0, 1);
      run.progress = eased;
      let processingVisibility = 1;
      if (run.activeStop) {
        const fadeDuration = Math.min(run.activeStop.delay, reducedMotion ? 620 : 360);
        const timeAtNode = elapsed - run.activeStop.arrivalTime;
        processingVisibility = 1 - easeOutCubic(THREE.MathUtils.clamp(timeAtNode / Math.max(fadeDuration, 1), 0, 1));
      } else if (delaysEnabled) {
        const fadeInDurationAfterNode = reducedMotion ? 520 : 260;
        const previousStop = [...run.stops].reverse().find((stop) => (
          stop.delay > 0
          && elapsed >= stop.endTime
          && elapsed < stop.endTime + fadeInDurationAfterNode
        ));
        if (previousStop) {
          processingVisibility = easeOutCubic(THREE.MathUtils.clamp(
            (elapsed - previousStop.endTime) / fadeInDurationAfterNode,
            0,
            1,
          ));
        }
      }
      run.visual.uniforms.uVisibility.value = runVisibility * processingVisibility;
      run.visual.uniforms.uProgress.value = delaysEnabled ? eased : eased * 1.08 - 0.025;
      run.visual.uniforms.uTime.value = time;
      run.position.copy(run.curve.getPointAt(eased));
      lightPosition ||= run.position;

      run.route.forEach((id) => {
        const node = nodes[id];
        const [nodeWidth, nodeDepth] = nodeFootprint(node);
        const distance = isRadialShape(node.shape)
          ? Math.max(Math.hypot(run.position.x - node.p[0], run.position.z - node.p[1]) - nodeWidth * 0.48, 0)
          : Math.hypot(
              Math.max(Math.abs(run.position.x - node.p[0]) - nodeWidth * 0.48, 0),
              Math.max(Math.abs(run.position.z - node.p[1]) - nodeDepth * 0.48, 0),
            );
        if (progress < 1 && distance < 0.72) nearNodeIds.add(id);
      });
      if (run.activeStop) {
        const activeRuns = activeNodeRuns.get(run.activeStop.id) || new Set<number>();
        activeRuns.add(run.index);
        activeNodeRuns.set(run.activeStop.id, activeRuns);
        const batch = nodeProgressBatches.get(run.activeStop.id) || new Map<number, number>();
        batch.set(run.index, run.activeStopProgress);
        nodeProgressBatches.set(run.activeStop.id, batch);
      }

      const { packet, packetHalo, packetFlare } = run.visual;
      packet.position.copy(run.position);
      packetHalo.position.copy(run.position);
      packetFlare.position.copy(run.position);
      const packetVisibility = pulseVisibilityAt(run.position, run.route);
      packet.material.opacity = packetVisibility * runVisibility;
      packetHalo.material.opacity = packetHaloOpacity * packetVisibility * runVisibility;
      packetFlare.material.opacity = packetFlareOpacity * packetVisibility * runVisibility;
      packetHalo.scale.setScalar(0.86 + Math.sin(time * 7 + run.index * 0.8) * 0.1);
      packetFlare.scale.setScalar((isVariant2 ? 1.35 : 0.8) + Math.sin(time * 5.5 + run.index) * (isVariant2 ? 0.12 : 0.06));
    });

    nodeProgressBatches.forEach((batch, nodeId) => {
      const activeRuns = activeNodeRuns.get(nodeId);
      if (!activeRuns?.size) {
        nodeProgressBatches.delete(nodeId);
        return;
      }
      batch.forEach((_, runIndex) => {
        if (!activeRuns.has(runIndex)) batch.set(runIndex, 1);
      });
    });

    Object.entries(cardObjects).forEach(([id, card]) => {
      const nodeGlow = card.userData.nodeGlow as THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
      const haloUniform = nodeGlow.material.uniforms.uIntensity;
      const nodeProgressControl = card.userData.nodeProgressControl as NodeProgressControl;
      const glowState = card.userData.glowState as NodeGlowState;
      const isNearNode = nearNodeIds.has(id);
      const progressBatch = nodeProgressBatches.get(id);
      const cumulativeProgress = progressBatch?.size
        ? [...progressBatch.values()].reduce((sum, value) => sum + value, 0) / progressBatch.size
        : undefined;
      nodeProgressControl.setProgress(cumulativeProgress);

      if (!isNearNode) glowState.armed = true;
      if (isNearNode && glowState.armed && glowState.phase === 'idle') {
        glowState.phase = 'in';
        glowState.startedAt = time;
        glowState.armed = false;
      }

      if (glowState.phase === 'in') {
        const fadeInProgress = THREE.MathUtils.clamp((time - glowState.startedAt) / 0.3, 0, 1);
        glowState.value = easeOutCubic(fadeInProgress);
        if (fadeInProgress === 1) {
          glowState.value = 1;
          glowState.phase = 'out';
          glowState.startedAt = time;
        }
      } else if (glowState.phase === 'out') {
        const fadeOutProgress = THREE.MathUtils.clamp((time - glowState.startedAt) / 0.72, 0, 1);
        glowState.value = 1 - easeOutCubic(fadeOutProgress);
        if (fadeOutProgress === 1) {
          glowState.value = 0;
          glowState.phase = 'idle';
        }
      } else {
        glowState.value = 0;
      }

      haloUniform.value = glowState.value <= 0.001 ? 0 : glowState.value;
    });
    if (lightPosition) greenLight.position.set(lightPosition.x + network.position.x, 1.6, lightPosition.z + network.position.z);

    let hit: THREE.Intersection<THREE.Object3D> | undefined;
    if (interactive) {
      raycaster.setFromCamera(pointer, camera);
      const bodies = Object.values(cardObjects).map((card) => card.userData.body as THREE.Object3D);
      hit = raycaster.intersectObjects(bodies, false)[0];
      canvas.style.cursor = hit ? 'grab' : 'default';
    }
    Object.values(cardObjects).forEach((card) => {
      const hover = hit?.object === card.userData.body;
      const targetY = card.userData.baseY + (hover ? 0.18 : 0) + Math.sin(time * 1.1 + card.position.x) * 0.012;
      card.position.y = THREE.MathUtils.lerp(card.position.y, targetY, 0.08);
    });

    if (currentCameraZoom !== targetCameraZoom) {
      currentCameraZoom = targetCameraZoom;
      camera.zoom = currentCameraZoom;
      camera.updateProjectionMatrix();
    }
    controls.update();
    const iconFog = scene.fog;
    if (fogEnabled && iconFog instanceof THREE.Fog) {
      Object.values(cardObjects).forEach((card) => {
        const nodeFace = card.userData.nodeFace as CSS3DObject;
        nodeFace.getWorldPosition(iconWorldPosition);
        const distance = camera.position.distanceTo(iconWorldPosition);
        const fogAmount = THREE.MathUtils.smoothstep(distance, iconFog.near, iconFog.far);
        nodeFace.element.style.opacity = String(baseIconOpacity * (1 - fogAmount));

        const nodeProgressControl = card.userData.nodeProgressControl as NodeProgressControl;
        nodeProgressControl.object.getWorldPosition(iconWorldPosition);
        const progressDistance = camera.position.distanceTo(iconWorldPosition);
        const progressFogAmount = THREE.MathUtils.smoothstep(progressDistance, iconFog.near, iconFog.far);
        const progressOpacity = Number(nodeProgressControl.object.element.style.opacity || 0);
        nodeProgressControl.object.element.style.opacity = String(progressOpacity * (1 - progressFogAmount));
      });
    }
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const aspect = width / height;
    const base = width < 760 ? mobileCameraBase : desktopCameraBase;
    if (camera instanceof THREE.PerspectiveCamera) {
      const distance = base / Math.tan(THREE.MathUtils.degToRad(perspectiveFov * 0.5));
      const direction = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      camera.aspect = aspect;
      camera.fov = perspectiveFov;
      camera.near = Math.max(0.1, distance - 100);
      camera.far = distance + 100;
      controls.minDistance = distance * 0.8;
      controls.maxDistance = distance * 1.35;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = Math.max(0.1, distance - 4.5);
        scene.fog.far = distance + 13;
      }
    } else {
      camera.left = -base * aspect;
      camera.right = base * aspect;
      camera.top = base;
      camera.bottom = -base;
    }
    camera.zoom = currentCameraZoom;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    cssRenderer.setSize(width, height);
  }

  function setCameraZoom(nextZoom: number) {
    targetCameraZoom = THREE.MathUtils.clamp(nextZoom, 0.25, 2);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  frameId = requestAnimationFrame(animate);

  return {
    reroute: resetBeams,
    setCameraZoom,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (interactive) canvas.removeEventListener('pointermove', pointerMove);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Sprite) {
          object.geometry?.dispose?.();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (!material) return;
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        }
        if (object instanceof CSS3DObject) object.element.remove();
      });
      renderer.dispose();
      cssRenderer.domElement.remove();
    },
  };
}
