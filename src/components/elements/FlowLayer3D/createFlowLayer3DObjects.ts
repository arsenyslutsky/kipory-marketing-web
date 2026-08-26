import * as THREE from 'three';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import {
  createConnector3DObject,
  createFadingConnector3DObject,
} from '../Connector3D/createConnector3DObject';
import { resolveFlowLayer3DPath } from './resolveFlowLayer3D';
import type { FlowLayer3DConnectorStyle, FlowLayer3DPath } from './types';

export type CreateFlowLayer3DObjectsOptions = {
  aspectRatio: number;
  connector: FlowLayer3DConnectorStyle;
  paths: readonly FlowLayer3DPath[];
  worldHeight?: number;
};

export type FlowLayer3DObjects = {
  connectors: THREE.Object3D[];
  destroy: () => void;
  group: THREE.Group;
};

function disposeMaterial(material: THREE.Material) {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) value.dispose();
  });
  if (material instanceof THREE.ShaderMaterial) {
    Object.values(material.uniforms).forEach(({ value }) => {
      if (value instanceof THREE.Texture) value.dispose();
    });
  }
  material.dispose();
}

function disposeObjectResources(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Sprite)) {
      return;
    }
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material && disposeMaterial(material));
  });
}

export function createFlowLayer3DObjects({
  aspectRatio,
  connector,
  paths,
  worldHeight,
}: CreateFlowLayer3DObjectsOptions): FlowLayer3DObjects {
  const group = new THREE.Group();
  const connectors: THREE.Object3D[] = [];

  paths.forEach((route) => {
    const resolvedRoute = resolveFlowLayer3DPath(route, { aspectRatio, worldHeight });
    if (!resolvedRoute) return;
    const path = resolveFlowPath3D(resolvedRoute.path);
    const createConnector = resolvedRoute.fading
      ? createFadingConnector3DObject
      : createConnector3DObject;
    const connectorObject = createConnector({
      ...connector,
      fogEnabled: false,
      path,
    });
    connectorObject.userData.flowLayer3DPathId = resolvedRoute.id;
    connectors.push(connectorObject);
    group.add(connectorObject);
  });

  return {
    connectors,
    destroy() {
      disposeObjectResources(group);
      group.clear();
    },
    group,
  };
}
