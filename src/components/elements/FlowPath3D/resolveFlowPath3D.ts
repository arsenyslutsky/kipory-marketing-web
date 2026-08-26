import * as THREE from 'three';
import type {
  FlowPath3D,
  FlowPath3DDirection,
  ResolvedFlowPath3D,
} from './types';

export function createRoundedFlowPath3DPoints(
  points: THREE.Vector3[],
  amount: number,
  cornerSteps = 14,
) {
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

export function resolveFlowPath3D(
  path: FlowPath3D,
  direction: FlowPath3DDirection = 'forward',
): ResolvedFlowPath3D {
  if (path.points.length < 2) throw new Error('FlowPath3D requires at least two points.');
  const sourcePoints = path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const points = createRoundedFlowPath3DPoints(
    sourcePoints,
    THREE.MathUtils.clamp(path.curve ?? 0, 0, 100) / 100,
  );
  if (direction === 'reverse') points.reverse();

  const curve = path.interpolation === 'smooth'
    ? new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.15)
    : (() => {
      const result = new THREE.CurvePath<THREE.Vector3>();
      for (let index = 0; index < points.length - 1; index++) {
        result.add(new THREE.LineCurve3(points[index], points[index + 1]));
      }
      return result;
    })();

  return { curve, direction, points };
}
