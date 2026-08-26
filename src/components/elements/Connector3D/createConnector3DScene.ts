import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import {
  createConnector3DObject,
  createFadingConnector3DObject,
} from './createConnector3DObject';
import type { Connector3DSceneController, Connector3DSceneOptions } from './types';

export function createConnector3DScene(options: Connector3DSceneOptions): Connector3DSceneController {
  const {
    cameraPitch,
    cameraYaw,
    cameraZoom,
    color,
    connectorWidth,
    direction,
    elements,
    fading,
    interactive,
    opacity,
    path,
    pathCurve,
    perspectiveEffect,
    stroke,
  } = options;
  const { canvas, container } = elements;

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

  const resolvedPath = resolveFlowPath3D({ ...path, curve: pathCurve }, direction);
  const createConnector = fading ? createFadingConnector3DObject : createConnector3DObject;
  scene.add(createConnector({
    color,
    fogEnabled: false,
    opacity,
    path: resolvedPath,
    stroke,
    width: connectorWidth,
  }));

  const cameraTarget = new THREE.Vector3(0, 0, 0.35);
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
  const cameraBase = 5.5;
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

  let frameId = 0;
  let destroyed = false;
  function animate() {
    if (destroyed) return;
    frameId = requestAnimationFrame(animate);
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
        if (
          object instanceof THREE.Mesh
          || object instanceof THREE.Line
          || object instanceof THREE.Points
        ) {
          object.geometry?.dispose?.();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose());
        }
      });
      renderer.dispose();
    },
  };
}
