import * as THREE from 'three';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import {
  createConnector3DObject,
  createFadingConnector3DObject,
} from '../Connector3D/createConnector3DObject';
import { disposeFlowLayer3DObjectResources } from './disposeFlowLayer3DObjectResources';
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

export function createFlowLayer3DObjects({
  aspectRatio,
  connector,
  paths,
  worldHeight,
}: CreateFlowLayer3DObjectsOptions): FlowLayer3DObjects {
  const group = new THREE.Group();
  const connectors: THREE.Object3D[] = [];

  try {
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
  } catch (error) {
    disposeFlowLayer3DObjectResources(group);
    group.clear();
    throw error;
  }

  return {
    connectors,
    destroy() {
      disposeFlowLayer3DObjectResources(group);
      group.clear();
    },
    group,
  };
}
