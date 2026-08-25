import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { defaultColors } from '@/features/business-flow-3d/config';
import type {
  Node3DProgressMode,
  Node3DSceneController,
  Node3DSceneOptions,
  Node3DShape,
} from './types';

const svgAssetMarkupCache = new Map<string, Promise<string>>();

function loadSvgAssetMarkup(url: string) {
  const cached = svgAssetMarkupCache.get(url);
  if (cached) return cached;

  const request = fetch(url, { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) throw new Error(`Unable to load SVG asset: ${response.status}`);
    return response.text();
  });
  svgAssetMarkupCache.set(url, request);
  return request;
}

type ResolvedNodeGradient = {
  angle: number;
  end: string;
  mid: string;
  start: string;
};

type NodeProgressControl = {
  object: CSS3DObject;
  setProgress: (progress?: number) => void;
};

function radialSidesForShape(shape: Node3DShape) {
  return shape === 'circle' ? 64 : shape === 'triangle' ? 3 : shape === 'hexagon' ? 6 : undefined;
}

function nodeFootprint(nodeWidth: number, depth: number, shape: Node3DShape): [number, number] {
  if (shape === 'rectangle') return [nodeWidth, depth];
  if (shape === 'square') {
    const side = Math.sqrt(nodeWidth * depth);
    return [side, side];
  }
  const area = nodeWidth * depth;
  const radialSides = radialSidesForShape(shape);
  const diameter = shape === 'circle'
    ? Math.sqrt((4 * area) / Math.PI)
    : 2 * Math.sqrt((2 * area) / (
      (radialSides ?? 3) * Math.sin((Math.PI * 2) / (radialSides ?? 3))
    ));
  return [diameter, diameter];
}

export function createNode3DScene(options: Node3DSceneOptions): Node3DSceneController {
  const {
    assetBasePath,
    cameraPitch,
    cameraYaw,
    cameraZoom,
    depth,
    elements,
    floating,
    frontGradientAngle,
    frontGradientEndColor,
    frontGradientMidColor,
    frontGradientStartColor,
    glowIntensity,
    icon,
    iconOpacity,
    interactive,
    mode,
    nodeCornerRadius,
    nodeDepth,
    nodeScale,
    nodeWidth,
    outlineOpacity,
    outlineWidth,
    perspectiveEffect,
    progress,
    progressBarHeight,
    progressMode,
    progressPadding,
    shape,
    showProgress,
    sideXGradientAngle,
    sideXGradientEndColor,
    sideXGradientMidColor,
    sideXGradientStartColor,
    sideZGradientAngle,
    sideZGradientEndColor,
    sideZGradientMidColor,
    sideZGradientStartColor,
  } = options;
  const { canvas, container, cssLayer } = elements;
  const isDark = mode === 'dark';
  const theme = defaultColors[mode];
  const palette = theme.scene;
  const effects = theme.effects;
  const fogEnabled = true;
  const normalizeGradientAngle = (angle: number, fallback: number) => (
    Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : fallback
  );
  const frontGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(frontGradientAngle, 32),
    start: frontGradientStartColor || palette.cardHighlight,
    mid: frontGradientMidColor || palette.card,
    end: frontGradientEndColor || palette.cardShadow,
  };
  const sideXGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(sideXGradientAngle, 18),
    start: sideXGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: sideXGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: sideXGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const sideZGradient: ResolvedNodeGradient = {
    angle: normalizeGradientAngle(sideZGradientAngle, 18),
    start: sideZGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: sideZGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: sideZGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const resolvedNodeScale = THREE.MathUtils.clamp(nodeScale, 0.1, 3);
  const nodeHeight = Math.max(THREE.MathUtils.clamp(Math.round(nodeDepth), 1, 64), 0.1) * (0.22 / 12);
  const nodeCornerRadiusPixels = THREE.MathUtils.clamp(nodeCornerRadius, 0, 50);
  const resolvedOutlineOpacity = THREE.MathUtils.clamp(outlineOpacity, 0, 1);
  const resolvedOutlineWidth = THREE.MathUtils.clamp(outlineWidth, 0, 5);
  const resolvedProgressMode: Node3DProgressMode = progressMode === 'outline' ? 'outline' : 'bar';
  const resolvedProgressPadding = THREE.MathUtils.clamp(progressPadding, 0, 3);
  const resolvedProgressBarHeight = THREE.MathUtils.clamp(Math.round(progressBarHeight), 0, 100);
  const baseIconOpacity = THREE.MathUtils.clamp(iconOpacity, 0, 1);
  const resolvedGlowIntensity = THREE.MathUtils.clamp(glowIntensity, 0, 1);
  const resolvedProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const [width, cardDepth] = nodeFootprint(
    Math.max(0.1, nodeWidth),
    Math.max(0.1, depth),
    shape,
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
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
  scene.background = null;
  scene.fog = new THREE.Fog(palette.fog, isDark ? 20 : 22, isDark ? 38 : 39);

  const baseBottom = 0.4 - 0.11;
  const cameraTarget = new THREE.Vector3(0, baseBottom + nodeHeight * 0.5, 0);
  const pitch = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraPitch, 0, 65));
  const yaw = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(cameraYaw, -180, 180));
  const cameraHeading = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const cameraDirection = new THREE.Vector3(
    cameraHeading.x * Math.cos(pitch),
    Math.sin(pitch),
    cameraHeading.z * Math.cos(pitch),
  );
  const perspectiveAmount = THREE.MathUtils.clamp(perspectiveEffect, 0, 100) / 100;
  const perspectiveFov = THREE.MathUtils.lerp(2, 68, perspectiveAmount);
  const cameraBase = Math.max(3.6, width * 0.72, cardDepth * 0.9);
  const perspectiveDistance = cameraBase / Math.tan(THREE.MathUtils.degToRad(perspectiveFov * 0.5));
  const camera: THREE.OrthographicCamera | THREE.PerspectiveCamera = perspectiveAmount === 0
    ? new THREE.OrthographicCamera(-cameraBase, cameraBase, cameraBase, -cameraBase, 0.1, 100)
    : new THREE.PerspectiveCamera(perspectiveFov, 1, Math.max(0.1, perspectiveDistance - 100), perspectiveDistance + 100);
  camera.position.copy(cameraTarget).addScaledVector(
    cameraDirection,
    camera instanceof THREE.PerspectiveCamera ? perspectiveDistance : 24,
  );
  camera.zoom = THREE.MathUtils.clamp(cameraZoom, 0.25, 2);
  camera.lookAt(cameraTarget);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(cameraTarget);
  controls.enabled = interactive;
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  if (camera instanceof THREE.PerspectiveCamera) {
    controls.minDistance = perspectiveDistance * 0.8;
    controls.maxDistance = perspectiveDistance * 1.35;
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
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 9;
  key.shadow.blurSamples = 24;
  scene.add(key);

  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: isDark ? 0.42 : 0.24,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      fog: fogEnabled,
    }),
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.13;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.renderOrder = -90;
  scene.add(shadowCatcher);

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
    faceWidth: number,
    faceDepth: number,
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
        uWidth: { value: faceWidth },
        uDepth: { value: faceDepth },
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
    if (resolvedOutlineWidth === 0 || resolvedOutlineOpacity === 0) return new THREE.Group();
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
      if (points.length === 0) return;
      const segments = new LineSegments2(
        new LineSegmentsGeometry().setPositions(points.flatMap((point) => [point.x, point.y, point.z])),
        createNodeOutlineMaterial(),
      );
      segments.renderOrder = 3;
      outlines.add(segments);
    });
    return outlines;
  }

  function nodeProgressOutlineMetrics(faceWidth: number, faceDepth: number, nodeShape: Node3DShape) {
    const radialSides = radialSidesForShape(nodeShape);
    const isRadial = radialSides !== undefined;
    const viewportWidth = isRadial ? 300 : 512;
    const viewportHeight = 300;
    const defaultInset = Math.min(
      viewportHeight * 0.24,
      Math.max(16, resolvedProgressBarHeight * 0.65 + 6),
    );
    const inset = Math.min(viewportHeight * 0.485, defaultInset * resolvedProgressPadding);
    return {
      radialSides,
      viewportWidth,
      viewportHeight,
      inset,
      worldScaleX: faceWidth * (isRadial ? 0.9 / 300 : 0.94 / 512),
      worldScaleZ: faceDepth * 0.9 / 300,
    };
  }

  function nodeFaceObject(
    asset: string,
    faceWidth: number,
    faceDepth: number,
    height: number,
    nodeShape: Node3DShape,
  ) {
    const imageUrl = `${assetBasePath.replace(/\/$/, '')}/${asset}`;
    const { viewportWidth, viewportHeight, inset, worldScaleX, worldScaleZ } = nodeProgressOutlineMetrics(
      faceWidth,
      faceDepth,
      nodeShape,
    );
    const iconPadding = 6;
    const availableWidth = Math.max(1, (viewportWidth - (inset + iconPadding) * 2) * worldScaleX);
    const availableDepth = Math.max(1, (viewportHeight - (inset + iconPadding) * 2) * worldScaleZ);
    const shapeArtworkScale = nodeShape === 'circle'
      ? 0.512
      : nodeShape === 'rectangle'
        ? 0.8
        : nodeShape === 'triangle'
          ? 0.82 / (Math.sqrt(3) + 1)
          : nodeShape === 'hexagon'
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
        if (element.getAttribute('stroke') !== 'none') element.setAttribute('stroke', 'currentColor');
        element.setAttribute('shape-rendering', 'geometricPrecision');
      });
      svg.querySelectorAll<SVGElement>('[fill]').forEach((element) => {
        if (element.getAttribute('fill') !== 'none') element.setAttribute('fill', 'currentColor');
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
    faceWidth: number,
    faceDepth: number,
    height: number,
    nodeShape: Node3DShape,
  ): NodeProgressControl {
    const progressContainer = document.createElement('div');
    progressContainer.setAttribute('aria-hidden', 'true');
    Object.assign(progressContainer.style, {
      opacity: '0',
      transition: 'opacity 120ms ease-out',
      pointerEvents: 'none',
      backfaceVisibility: 'hidden',
    });

    if (resolvedProgressMode === 'bar') {
      Object.assign(progressContainer.style, {
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
      progressContainer.append(track);
      const object = new CSS3DObject(progressContainer);
      object.rotation.x = -Math.PI / 2;
      const edgeInset = THREE.MathUtils.clamp(0.19 * resolvedProgressPadding, 0, 0.44);
      const sideInset = THREE.MathUtils.clamp(0.21 * resolvedProgressPadding, 0, 0.46);
      object.position.set(0, height * 0.5 + 0.012, faceDepth * (0.5 - edgeInset));
      object.scale.set(faceWidth * (1 - sideInset * 2) / 240, faceDepth * 0.055 / 8, 1);
      return {
        object,
        setProgress(nextProgress) {
          const visible = resolvedProgressBarHeight > 0 && nextProgress !== undefined;
          progressContainer.style.opacity = visible ? '1' : '0';
          track.style.opacity = visible ? '1' : '0';
          fill.style.transform = `scaleX(${nextProgress ?? 0})`;
        },
      };
    }

    const svgNamespace = 'http://www.w3.org/2000/svg';
    const { radialSides, viewportWidth, viewportHeight, inset, worldScaleX, worldScaleZ } = nodeProgressOutlineMetrics(
      faceWidth,
      faceDepth,
      nodeShape,
    );
    Object.assign(progressContainer.style, {
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
    });
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', `0 0 ${viewportWidth} ${viewportHeight}`);
    svg.setAttribute('width', String(viewportWidth));
    svg.setAttribute('height', String(viewportHeight));
    svg.style.overflow = 'visible';
    const createPath = () => {
      if (nodeShape === 'circle') {
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
    progressContainer.append(svg);
    const object = new CSS3DObject(progressContainer);
    object.rotation.x = -Math.PI / 2;
    object.position.set(0, height * 0.5 + 0.014, 0);
    object.scale.set(worldScaleX, worldScaleZ, 1);
    return {
      object,
      setProgress(nextProgress) {
        const visible = resolvedProgressBarHeight > 0 && nextProgress !== undefined;
        progressContainer.style.opacity = visible ? '1' : '0';
        svg.style.opacity = visible ? '1' : '0';
        fill.style.strokeDashoffset = String(1 - (nextProgress ?? 0));
      },
    };
  }

  function createNodeGlowMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uIntensity: { value: resolvedGlowIntensity },
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

  const group = new THREE.Group();
  group.position.set(0, baseBottom + nodeHeight * 0.5, 0);
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
  const frontSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'x', false, 'down', 0.96, sideXGradient);
  const backSideMaterial = createCardSideMaterial(nodeHeight, width, cardDepth, 'x', true, 'up', isDark ? 0.74 : 0.84, sideXGradient);
  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: palette.cardShadow,
    roughness: 0.66,
    metalness: 0.02,
    fog: fogEnabled,
  });
  const radialSides = radialSidesForShape(shape);
  const isRadial = radialSides !== undefined;
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
  const body = new THREE.Mesh(bodyGeometry, bodyMaterials);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  group.add(isRadial
    ? createRadialFaceOutline(width * 0.5, nodeHeight, radialSides)
    : createCardFaceOutlines(bodyGeometry));
  const nodeFace = nodeFaceObject(icon, width, cardDepth, nodeHeight, shape);
  group.add(nodeFace);
  const nodeProgress = nodeProgressObject(width, cardDepth, nodeHeight, shape);
  nodeProgress.setProgress(showProgress ? resolvedProgress : undefined);
  group.add(nodeProgress.object);
  scene.add(group);

  const pointer = new THREE.Vector2(5, 5);
  const raycaster = new THREE.Raycaster();
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
  function animate() {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    let hovered = false;
    if (interactive) {
      raycaster.setFromCamera(pointer, camera);
      hovered = raycaster.intersectObject(body, false).length > 0;
      canvas.style.cursor = hovered ? 'grab' : 'default';
    }
    const targetY = baseBottom + nodeHeight * 0.5
      + (hovered ? 0.18 : 0)
      + (floating ? Math.sin(time * 1.1) * 0.012 : 0);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.08);
    controls.update();
    if (scene.fog instanceof THREE.Fog) {
      nodeFace.getWorldPosition(iconWorldPosition);
      const distance = camera.position.distanceTo(iconWorldPosition);
      const fogAmount = THREE.MathUtils.smoothstep(distance, scene.fog.near, scene.fog.far);
      nodeFace.element.style.opacity = String(baseIconOpacity * (1 - fogAmount));
    }
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }

  function resize() {
    const viewportWidth = Math.max(container.clientWidth, 1);
    const viewportHeight = Math.max(container.clientHeight, 1);
    const aspect = viewportWidth / viewportHeight;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
      camera.fov = perspectiveFov;
    } else {
      camera.left = -cameraBase * aspect;
      camera.right = cameraBase * aspect;
      camera.top = cameraBase;
      camera.bottom = -cameraBase;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(viewportWidth, viewportHeight, false);
    cssRenderer.setSize(viewportWidth, viewportHeight);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  frameId = requestAnimationFrame(animate);

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (interactive) canvas.removeEventListener('pointermove', pointerMove);
      controls.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh
          || object instanceof THREE.Line
          || object instanceof THREE.Points
          || object instanceof THREE.Sprite
          || object instanceof Line2
          || object instanceof LineSegments2
        ) {
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
      });
      renderer.dispose();
      cssLayer.replaceChildren();
    },
  };
}
