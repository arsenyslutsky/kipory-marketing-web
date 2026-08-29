import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, type CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { defaultColors } from '@/features/business-flow-3d/config';
import { createNode3DObject } from './createNode3DObject';
import {
  disposeNode3DGradientTextures,
  isNode3DManagedGradientTexture,
} from './node3DGradientTextureCache';
import type {
  Node3DResolvedGradient,
  Node3DSceneController,
  Node3DSceneOptions,
  Node3DShape,
} from './types';

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
    iconColor,
    iconOpacity,
    iconStrokeColor,
    iconStrokeOpacity,
    iconStrokeWidth,
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
  const fogEnabled = true;
  const normalizeGradientAngle = (angle: number, fallback: number) => (
    Number.isFinite(angle) ? ((angle % 360) + 360) % 360 : fallback
  );
  const frontGradient: Node3DResolvedGradient = {
    angle: normalizeGradientAngle(frontGradientAngle, 32),
    start: frontGradientStartColor || palette.cardHighlight,
    mid: frontGradientMidColor || palette.card,
    end: frontGradientEndColor || palette.cardShadow,
  };
  const sideXGradient: Node3DResolvedGradient = {
    angle: normalizeGradientAngle(sideXGradientAngle, 18),
    start: sideXGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: sideXGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: sideXGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const sideZGradient: Node3DResolvedGradient = {
    angle: normalizeGradientAngle(sideZGradientAngle, 18),
    start: sideZGradientStartColor || palette.cardSideHighlight || palette.cardHighlight,
    mid: sideZGradientMidColor || palette.cardSideMid || palette.cardSide,
    end: sideZGradientEndColor || palette.cardSideShadow || palette.cardShadow,
  };
  const resolvedNodeScale = THREE.MathUtils.clamp(nodeScale, 0.1, 3);
  const nodeHeight = Math.max(THREE.MathUtils.clamp(Math.round(nodeDepth), 1, 64), 0.1) * (0.22 / 12);
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

  const group = createNode3DObject({
    assetBasePath,
    cardDepth,
    fogEnabled,
    frontGradient,
    height: nodeHeight,
    icon,
    iconColor,
    iconOpacity,
    iconStrokeColor,
    iconStrokeOpacity,
    iconStrokeWidth,
    id: 'node-3d-preview',
    initialGlowIntensity: resolvedGlowIntensity,
    initialProgress: showProgress ? resolvedProgress : undefined,
    isDark,
    isVariant2: true,
    nodeCornerRadius,
    outlineOpacity,
    outlineWidth,
    position: [0, 0],
    progressBarHeight,
    progressMode,
    progressPadding,
    renderer,
    scale: resolvedNodeScale,
    shape,
    sideXGradient,
    sideZGradient,
    theme,
    tier: 0,
    width,
  });
  scene.add(group);
  const body = group.userData.body as THREE.Mesh;
  const nodeFace = group.userData.nodeFace as CSS3DObject;

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
        ) {
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
      });
      disposeNode3DGradientTextures(renderer);
      renderer.dispose();
      cssLayer.replaceChildren();
    },
  };
}
