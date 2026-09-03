import * as THREE from 'three';
import {
  createBeam3DFlareTexture,
  createBeam3DObject,
  type Beam3DObject,
} from '@/components/elements/Beam3D/createBeam3DObject';
import type { Beam3DColors } from '@/components/elements/Beam3D/types';
import {
  createConnector3DObject,
  createFadingConnector3DObject,
} from '@/components/elements/Connector3D/createConnector3DObject';
import { createRoundedFlowPath3DPoints } from '@/components/elements/FlowPath3D/resolveFlowPath3D';
import { resolveNodeShadowProps } from '@/components/elements/FlowLayer3D/resolveNodeShadowProps';
import type { NodeShadowProps } from '@/components/elements/FlowLayer3D';
import { getBusinessFlowPalette } from '@/features/business-flow-palette';
import {
  createNode3DObject,
  type Node3DGlowState,
  type Node3DProgressControl,
  type Node3DResolvedGradient,
} from '@/components/elements/Node3D/createNode3DObject';
import {
  disposeNode3DGradientTextures,
  isNode3DManagedGradientTexture,
} from '@/components/elements/Node3D/node3DGradientTextureCache';
import {
  createActiveFrameLoop,
  resolveWorkflowRenderScale,
  type ActiveFrame,
} from '@/components/elements/workflow-runtime';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import type { ConnectorStrokeType, FlowConfig, NodeGeometryShape, NodeProgressMode, NodeShape, SignalFlowMode, SignalFlowTheme, SignalFlowVariant } from '../types';

interface SceneElements {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  cssLayer: HTMLElement;
}

interface SceneOptions extends NodeShadowProps {
  active?: boolean;
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
  connectorElevation: number;
  showContinuationConnectors: boolean;
  pathCurve: number;
  outlineOpacity: number;
  outlineWidth: number;
  nodeScale: number;
  nodeElevation: number;
  nodeDepth: number;
  nodeDepthRandom: number;
  nodeShape: NodeShape;
  nodeCornerRadius: number;
  nodeIconOpacity: number;
  iconStrokeColor?: string;
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
  progressBarColor?: string;
  progressBarOpacity?: number;
  concurrentBeams: number;
  minEmitDelay: number;
  maxEmitDelay: number;
  reducedMotion: boolean;
  resolutionScale?: 'display' | number;
  onReady?: () => void;
  elements: SceneElements;
}

export interface SignalFlowSceneController {
  reroute: () => void;
  setCameraZoom: (zoom: number) => void;
  setActive: (active: boolean) => void;
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

type NodeGlowState = Node3DGlowState;
type NodeProgressControl = Node3DProgressControl;
type ResolvedNodeGradient = Node3DResolvedGradient;

const NODE_FLOAT_AMPLITUDE = 0.012;
const CONNECTOR_NODE_CLEARANCE = 0.02;

interface RouteStop {
  id: string;
  curveProgress: number;
  travelProgress: number;
  delay: number;
  arrivalTime: number;
  endTime: number;
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
  visual: Beam3DObject;
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

export function createSignalFlowScene(options: SceneOptions): SignalFlowSceneController {
  const {
    active = true,
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
    connectorElevation,
    showContinuationConnectors,
    pathCurve,
    outlineOpacity,
    outlineWidth,
    nodeScale,
    nodeElevation,
    nodeDepth,
    nodeDepthRandom,
    nodeShape,
    nodeCornerRadius,
    nodeIconOpacity,
    iconStrokeColor,
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
    nodeShadowBias,
    nodeShadowBlurSamples,
    nodeShadowColor,
    nodeShadowLightX,
    nodeShadowLightY,
    nodeShadowLightZ,
    nodeShadowNormalBias,
    nodeShadowOpacity,
    nodeShadowRadius,
    progressPadding,
    progressBarHeight,
    progressBarColor,
    progressBarOpacity = 1,
    concurrentBeams,
    minEmitDelay,
    maxEmitDelay,
    reducedMotion,
    resolutionScale = 'display',
    onReady,
    elements,
  } = options;
  const { container, canvas, cssLayer } = elements;
  const isVariant2 = variant === 'variant-2';
  const isDark = mode === 'dark';
  const businessFlowPalette = getBusinessFlowPalette(mode);
  const nodeShadow = resolveNodeShadowProps({
    nodeShadowBias,
    nodeShadowBlurSamples,
    nodeShadowColor,
    nodeShadowLightX,
    nodeShadowLightY,
    nodeShadowLightZ,
    nodeShadowNormalBias,
    nodeShadowOpacity,
    nodeShadowRadius,
  }, {
    nodeShadowBias: -0.0003,
    nodeShadowBlurSamples: isVariant2 ? 24 : 8,
    nodeShadowColor: businessFlowPalette.nodeShadow,
    nodeShadowLightX: -7,
    nodeShadowLightY: 14,
    nodeShadowLightZ: 7,
    nodeShadowNormalBias: isVariant2 ? 0.025 : 0,
    nodeShadowOpacity: isDark ? 0.42 : 0.24,
    nodeShadowRadius: isVariant2 ? 9 : 1,
  });
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
  const perspectiveAmount = THREE.MathUtils.clamp(perspectiveEffect, 0, 100) / 100;
  const resolvedCameraPitch = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraPitch, 0, 65));
  const resolvedCameraZoom = THREE.MathUtils.clamp(cameraZoom, 0.25, 2);
  let currentCameraZoom = resolvedCameraZoom;
  let targetCameraZoom = resolvedCameraZoom;
  const resolvedConnectorOpacity = THREE.MathUtils.clamp(connectorOpacity, 0, 1);
  const resolvedConnectorWidth = THREE.MathUtils.clamp(connectorWidth, 0, 5);
  const resolvedPathCurve = THREE.MathUtils.clamp(pathCurve, 0, 100) / 100;
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
    throw new Error('BusinessFlow3D needs a visible root node with at least one connection.');
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
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
  key.position.set(
    nodeShadow.nodeShadowLightX,
    nodeShadow.nodeShadowLightY,
    nodeShadow.nodeShadowLightZ,
  );
  key.castShadow = true;
  key.shadow.mapSize.set(isVariant2 ? 1024 : 2048, isVariant2 ? 1024 : 2048);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  key.shadow.bias = nodeShadow.nodeShadowBias;
  key.shadow.normalBias = nodeShadow.nodeShadowNormalBias;
  key.shadow.radius = nodeShadow.nodeShadowRadius;
  key.shadow.blurSamples = nodeShadow.nodeShadowBlurSamples;
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
    color: nodeShadow.nodeShadowColor,
    opacity: nodeShadow.nodeShadowOpacity,
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
        uMaskColor: { value: new THREE.Color(isDark ? 0xffffff : palette.gridMajor) },
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

  const baseIconOpacity = THREE.MathUtils.clamp(nodeIconOpacity, 0, 1);

  function createCard(id: string, data: RuntimeNode) {
    const [width, cardDepth] = nodeFootprint(data);
    const group = createNode3DObject({
      assetBasePath,
      cardDepth,
      fogEnabled,
      frontGradient,
      height: data.height,
      icon: data.svg,
      iconOpacity: nodeIconOpacity,
      iconStrokeColor,
      id,
      isDark,
      isVariant2,
      nodeCornerRadius,
      nodeElevation,
      outlineOpacity,
      outlineWidth,
      position: data.p,
      progressBarHeight: resolvedProgressBarHeight,
      progressBarColor,
      progressBarOpacity,
      progressMode: resolvedNodeProgressMode,
      progressPadding: resolvedProgressPadding,
      renderer,
      scale: resolvedNodeScale,
      shape: data.shape,
      sideXGradient,
      sideZGradient,
      theme,
      tier: data.tier,
      width,
    });
    cardObjects[id] = group;
    network.add(group);
  }

  Object.entries(nodes).forEach(([id, data]) => {
    if (!hiddenNodeIds.has(id)) createCard(id, data);
  });

  const lowestNodeBodyY = Math.min(...Object.values(cardObjects).map((card) => {
    card.updateWorldMatrix(true, true);
    const body = card.userData.body as THREE.Object3D;
    return new THREE.Box3().setFromObject(body).min.y;
  }));
  const requestedConnectorY = 0.11 + (Number.isFinite(connectorElevation) ? connectorElevation : 0);
  const connectorY = Math.min(
    requestedConnectorY,
    lowestNodeBodyY - NODE_FLOAT_AMPLITUDE - CONNECTOR_NODE_CLEARANCE,
  );

  function edgePoints(a: string, b: string) {
    const pointA = nodes[a].p;
    const pointB = nodes[b].p;
    const midZ = (pointA[1] + pointB[1]) * 0.5;
    return [
      new THREE.Vector3(pointA[0], connectorY, pointA[1]),
      new THREE.Vector3(pointA[0], connectorY, midZ),
      new THREE.Vector3(pointB[0], connectorY, midZ),
      new THREE.Vector3(pointB[0], connectorY, pointB[1]),
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
    return createRoundedFlowPath3DPoints(points, resolvedPathCurve);
  }

  function createConnectorObject(
    points: THREE.Vector3[],
    curve: THREE.Curve<THREE.Vector3>,
    opacity = resolvedConnectorOpacity,
  ) {
    return createConnector3DObject({
      color: effects.nodeStroke,
      fogEnabled,
      opacity,
      path: { curve, direction: 'forward', points },
      stroke: connectorStroke,
      width: resolvedConnectorWidth,
    });
  }

  function createFadingConnectorObject(points: THREE.Vector3[]) {
    const curve = makeCurve(points);
    return createFadingConnector3DObject({
      color: effects.nodeStroke,
      fogEnabled,
      opacity: resolvedConnectorOpacity,
      path: { curve, direction: 'forward', points },
      stroke: connectorStroke,
      width: resolvedConnectorWidth,
    });
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

  const continuationY = connectorY;
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

  const beamColors: Beam3DColors = {
    beam: effects.beam,
    beamHighlight: effects.beamHighlight,
    flare: effects.flare,
    flareStops: effects.flareStops,
    packetCore: effects.packetCore,
    packetHalo: effects.packetHalo,
  };
  const sharedFlareTexture = createBeam3DFlareTexture(beamColors.flareStops);
  const placeholderCurve = new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));
  const placeholderPath = {
    curve: placeholderCurve,
    direction: 'forward' as const,
    points: [new THREE.Vector3(), new THREE.Vector3(0, 0, 1)],
  };

  function createBeamVisual() {
    const visual = createBeam3DObject({
      colors: beamColors,
      flareTexture: sharedFlareTexture,
      fogEnabled,
      mode,
      path: placeholderPath,
      style: isVariant2 ? 'ribbon' : 'tube',
    });
    network.add(visual.group);
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
    run.visual.setVisible(visible);
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
    run.visual.setPath({ curve: run.curve, direction: 'forward', points: pathPoints });
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

  let currentElapsedMs = 0;

  function resetBeams(now = currentElapsedMs * resolvedSpeed) {
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

  const iconWorldPosition = new THREE.Vector3();
  let destroyed = false;
  let ready = false;

  function animate({ elapsedMs }: ActiveFrame) {
    if (destroyed) return;
    currentElapsedMs = elapsedMs;
    const now = elapsedMs * resolvedSpeed;
    const time = (elapsedMs / 1000) * resolvedSpeed;
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

      const packetVisibility = pulseVisibilityAt(run.position, run.route);
      run.visual.update({
        packetVisibility: packetVisibility * runVisibility,
        phase: run.index,
        progress: eased,
        time,
        visibility: runVisibility * processingVisibility,
      });
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
      const targetY = card.userData.baseY
        + (hover ? 0.18 : 0)
        + Math.sin(time * 1.1 + card.position.x) * NODE_FLOAT_AMPLITUDE;
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
    renderer.shadowMap.needsUpdate = false;
    if (!ready) {
      ready = true;
      onReady?.();
    }
  }

  const frameLoop = createActiveFrameLoop(animate);

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
    const renderScale = resolveWorkflowRenderScale(container, resolutionScale);
    renderer.setSize(
      Math.max(1, Math.round(width * renderScale)),
      Math.max(1, Math.round(height * renderScale)),
      false,
    );
    cssRenderer.setSize(width, height);
    renderer.shadowMap.needsUpdate = true;
  }

  function setCameraZoom(nextZoom: number) {
    targetCameraZoom = THREE.MathUtils.clamp(nextZoom, 0.25, 2);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  frameLoop.setActive(active);

  return {
    reroute: () => resetBeams(),
    setActive: frameLoop.setActive,
    setCameraZoom,
    destroy() {
      destroyed = true;
      frameLoop.destroy();
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
              if (value instanceof THREE.Texture && !isNode3DManagedGradientTexture(value)) {
                value.dispose();
              }
            });
            material.dispose();
          });
        }
        if (object instanceof CSS3DObject) object.element.remove();
      });
      disposeNode3DGradientTextures(renderer);
      renderer.dispose();
      cssRenderer.domElement.remove();
    },
  };
}
