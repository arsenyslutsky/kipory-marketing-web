import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { createRoundedFlowPath3DPoints } from '../FlowPath3D/resolveFlowPath3D';
import type { ResolvedFlowPath3D } from '../FlowPath3D/types';
import type { Connector3DStroke } from './types';

export type CreateConnector3DObjectOptions = {
  color: THREE.ColorRepresentation;
  fogEnabled: boolean;
  opacity: number;
  path: ResolvedFlowPath3D;
  stroke: Connector3DStroke;
  width: number;
};

export const createRoundedConnector3DPoints = createRoundedFlowPath3DPoints;

function createConnectorLineMaterial({
  color,
  dashed,
  fogEnabled,
  opacity,
  width,
}: {
  color: THREE.ColorRepresentation;
  dashed: boolean;
  fogEnabled: boolean;
  opacity: number;
  width: number;
}) {
  return new LineMaterial({
    color,
    transparent: true,
    opacity,
    linewidth: width,
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

function createConnectorDotsMaterial({
  color,
  fogEnabled,
  opacity,
  width,
}: {
  color: THREE.ColorRepresentation;
  fogEnabled: boolean;
  opacity: number;
  width: number;
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uPointSize: { value: width },
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

export function createConnector3DObject({
  color,
  fogEnabled,
  opacity,
  path,
  stroke,
  width,
}: CreateConnector3DObjectOptions) {
  const connector = new THREE.Group();
  connector.renderOrder = -50;
  const resolvedOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
  const resolvedWidth = THREE.MathUtils.clamp(width, 0, 5);
  if (resolvedWidth === 0 || resolvedOpacity === 0) return connector;

  if (stroke === 'solid' || stroke === 'dashed') {
    const line = new Line2(
      new LineGeometry().setPositions(path.points.flatMap((point) => [point.x, point.y, point.z])),
      createConnectorLineMaterial({
        color,
        dashed: stroke === 'dashed',
        fogEnabled,
        opacity: resolvedOpacity,
        width: resolvedWidth,
      }),
    );
    if (stroke === 'dashed') line.computeLineDistances();
    line.frustumCulled = false;
    connector.add(line);
    return connector;
  }

  const pathLength = path.curve.getLength();
  const dotSpacing = 0.15;
  const dotPositions: THREE.Vector3[] = [];
  for (let distance = dotSpacing * 0.5; distance < pathLength; distance += dotSpacing) {
    dotPositions.push(path.curve.getPointAt(distance / pathLength));
  }
  const dots = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(dotPositions),
    createConnectorDotsMaterial({
      color,
      fogEnabled,
      opacity: resolvedOpacity,
      width: resolvedWidth,
    }),
  );
  dots.frustumCulled = false;
  connector.add(dots);
  return connector;
}

export function createFadingConnector3DObject(options: CreateConnector3DObjectOptions) {
  const connector = new THREE.Group();
  connector.renderOrder = -50;
  const segmentCount = 12;
  for (let index = 0; index < segmentCount; index++) {
    const start = options.path.curve.getPointAt(index / segmentCount);
    const end = options.path.curve.getPointAt((index + 1) / segmentCount);
    connector.add(createConnector3DObject({
      ...options,
      opacity: options.opacity * (index + 0.5) / segmentCount,
      path: {
        curve: new THREE.LineCurve3(start, end),
        direction: options.path.direction,
        points: [start, end],
      },
    }));
  }
  return connector;
}
