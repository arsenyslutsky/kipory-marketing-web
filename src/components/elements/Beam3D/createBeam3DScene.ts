import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getBusinessFlowPalette } from '@/features/business-flow-palette';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import {
  createBeam3DFlareTexture,
  createBeam3DObject,
} from './createBeam3DObject';
import type { Beam3DColors, Beam3DSceneController, Beam3DSceneOptions } from './types';

export function createBeam3DScene(options: Beam3DSceneOptions): Beam3DSceneController {
  const {
    beamColor,
    beamWidth,
    cameraPitch,
    cameraYaw,
    cameraZoom,
    delayBeforeDissapear,
    direction,
    elements,
    flareColor,
    glowIntensity,
    highlightColor,
    interactive,
    mode,
    packetColor,
    packetCoreShape,
    packetCoreSize,
    packetHaloBlur,
    packetHaloColor,
    packetHaloSize,
    packetShadow,
    packetVisible,
    path,
    perspectiveEffect,
    playing,
    progress,
    softness,
    speed,
    startFade,
    style,
    trailLength,
    visibility,
  } = options;
  const { canvas, container } = elements;
  const flareStops = getBusinessFlowPalette(mode).flareStops;
  const resolvedPath = resolveFlowPath3D(path, direction);
  const colors: Beam3DColors = {
    beam: beamColor,
    beamHighlight: highlightColor,
    flare: flareColor,
    flareStops,
    packetCore: packetColor,
    packetHalo: packetHaloColor,
  };
  const flareTexture = createBeam3DFlareTexture(colors.flareStops);
  const beam = createBeam3DObject({
    beamWidth,
    colors,
    flareTexture,
    fogEnabled: false,
    glowIntensity,
    mode,
    packetCoreShape,
    packetCoreSize,
    packetHaloBlur,
    packetHaloSize,
    packetShadow,
    packetVisible,
    path: resolvedPath,
    softness,
    startFade,
    style,
    trailLength,
  });
  beam.setVisible(true);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = null;
  scene.add(beam.group);

  const bounds = new THREE.Box3().setFromPoints(resolvedPath.points);
  const cameraTarget = bounds.getCenter(new THREE.Vector3());
  const boundsSize = bounds.getSize(new THREE.Vector3());
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
  const cameraBase = Math.max(3, boundsSize.x * 0.64, boundsSize.z * 0.8);
  const perspectiveDistance = cameraBase / Math.tan(THREE.MathUtils.degToRad(perspectiveFov * 0.5));
  const camera: THREE.OrthographicCamera | THREE.PerspectiveCamera = perspectiveAmount === 0
    ? new THREE.OrthographicCamera(-cameraBase, cameraBase, cameraBase, -cameraBase, 0.1, 100)
    : new THREE.PerspectiveCamera(
      perspectiveFov,
      1,
      Math.max(0.1, perspectiveDistance - 100),
      perspectiveDistance + 100,
    );
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
  controls.minAzimuthAngle = -0.8;
  controls.maxAzimuthAngle = 1.42;

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
  }

  const clock = new THREE.Clock();
  let frameId = 0;
  let destroyed = false;
  function animate() {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    let resolvedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    let cycleVisibility = 1;
    if (playing) {
      const movementDuration = 4.3 / THREE.MathUtils.clamp(speed, 0.1, 4);
      const fadeDuration = movementDuration * 0.16;
      const endDelay = THREE.MathUtils.clamp(delayBeforeDissapear, 0, 10);
      const cycleTime = time % (movementDuration + endDelay + fadeDuration);
      const rawProgress = THREE.MathUtils.clamp(cycleTime / movementDuration, 0, 1);
      resolvedProgress = THREE.MathUtils.smootherstep(rawProgress, 0, 1);
      const fadeIn = THREE.MathUtils.smootherstep(
        THREE.MathUtils.clamp(cycleTime / (movementDuration * 0.08), 0, 1),
        0,
        1,
      );
      const fadeStart = movementDuration + endDelay;
      const fadeOut = cycleTime <= fadeStart
        ? 1
        : 1 - THREE.MathUtils.smootherstep(
          THREE.MathUtils.clamp((cycleTime - fadeStart) / fadeDuration, 0, 1),
          0,
          1,
        );
      cycleVisibility = fadeIn * fadeOut;
    }
    const resolvedVisibility = THREE.MathUtils.clamp(visibility, 0, 1) * cycleVisibility;
    beam.update({
      packetVisibility: resolvedVisibility,
      progress: resolvedProgress,
      time,
      visibility: resolvedVisibility,
    });
    controls.update();
    renderer.render(scene, camera);
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
      });
      renderer.dispose();
    },
  };
}
