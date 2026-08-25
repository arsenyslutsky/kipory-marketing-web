'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import styles from './BusinessFlowVertical.module.css';

export type PillarPoint = readonly [x: number, y: number];

export type PillarsConnectorsProps = {
  beamColor?: string;
  beamEmissionRandomness?: number;
  beamEnabled?: boolean;
  beamHeadGlowBlur?: number;
  beamHeadGlowOpacity?: number;
  beamHeadGlowRadius?: number;
  beamHighlightColor?: string;
  beamSpeed?: number;
  beamTrailLength?: number;
  burstFadeTime?: number;
  burstRadius?: number;
  burstStrength?: number;
  color?: string;
  connectorRadius?: number;
  maxConcurrentBeams?: number;
  opacity?: number;
  satellitePoints: PillarPoint[];
  showContinuationConnectors?: boolean;
  width?: number;
};

type BeamOrbStyle = CSSProperties & {
  '--beam-color': string;
  '--beam-glow-large': string;
  '--beam-glow-small': string;
  '--beam-head-glow-blur': string;
  '--beam-head-glow-opacity': string;
  '--beam-head-glow-radius': string;
  '--beam-highlight': string;
  '--beam-size': string;
};

type BurstStyle = CSSProperties & {
  '--burst-delay': string;
  '--burst-color': string;
  '--burst-core-fade-time': string;
  '--burst-fade-time': string;
  '--burst-highlight': string;
  '--burst-radius': string;
  '--burst-strength': string;
  '--burst-x': string;
  '--burst-y': string;
};

type CentralNode = keyof typeof coloredPoints;

type BeamTrace = {
  generation: number;
  sourceIndex: number;
  targetIndex: number;
};

type BeamRun = {
  arrivals: PillarPoint[];
  duration: number;
  initialDelay: number;
  route: PillarPoint[];
  trace: BeamTrace;
};

type BeamState = {
  activeRun: BeamRun;
  burstRuns: BeamRun[];
};

type PillarsBeamProps = {
  beamColor: string;
  beamEmissionRandomness: number;
  beamHeadGlowBlur: number;
  beamHeadGlowOpacity: number;
  beamHeadGlowRadius: number;
  beamHighlightColor: string;
  beamTrailLength: number;
  burstFadeTime: number;
  burstRadius: number;
  burstStrength: number;
  connectorRadius: number;
  satellitePoints: PillarPoint[];
  slot: number;
  sourceIndexes: number[];
  speed: number;
  targetIndexes: number[];
  showContinuationConnectors: boolean;
  width: number;
};

const coloredPoints = {
  server: [20, 50] as PillarPoint,
  graph: [40, 50] as PillarPoint,
  vector: [60, 50] as PillarPoint,
  intelligence: [80, 50] as PillarPoint,
};

const coloredRoutes: PillarPoint[][] = [
  [[26, 50], [34, 50]],
  [[46, 50], [54, 50]],
  [[66, 50], [74, 50]],
];

const centralOrder: CentralNode[] = ['server', 'graph', 'vector', 'intelligence'];
const continuationFadeBoundary = 12;
const minimumEmissionPause = 0.12;
const emissionPauseVariation = 1.08;

function seededEmissionUnit(slot: number) {
  let seed = Math.imul(slot + 1, 0x9e3779b1) >>> 0;
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 0x85ebca6b) >>> 0;
  seed ^= seed >>> 13;

  return (seed >>> 0) / 0x1_0000_0000;
}

function emissionDelay(
  trace: BeamTrace,
  slot: number,
  randomnessPercentage: number,
) {
  const randomness = Math.min(1, Math.max(0, randomnessPercentage / 100));
  const deterministicDelay = trace.generation === 0 ? slot * 0.28 : 0;

  if (randomness === 0) return deterministicDelay;

  const randomUnit = trace.generation === 0
    ? seededEmissionUnit(slot)
    : Math.random();
  const randomizedDelay = minimumEmissionPause + randomUnit * emissionPauseVariation;

  return deterministicDelay + (randomizedDelay - deterministicDelay) * randomness;
}

function distance(a: PillarPoint, b: PillarPoint) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function moveToward(from: PillarPoint, to: PillarPoint, amount: number): PillarPoint {
  const length = distance(from, to);
  if (length === 0) return from;
  return [
    from[0] + ((to[0] - from[0]) / length) * amount,
    from[1] + ((to[1] - from[1]) / length) * amount,
  ];
}

function roundedPolylinePath(rawPoints: PillarPoint[], cornerRadius: number) {
  const points = rawPoints.filter((point, index) => (
    index === 0 || distance(point, rawPoints[index - 1]) > 0.001
  ));

  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  const resolvedRadius = Math.max(0, cornerRadius);
  if (resolvedRadius === 0) {
    return points.slice(1).reduce(
      (path, point) => `${path} L ${point[0]} ${point[1]}`,
      `M ${points[0][0]} ${points[0][1]}`,
    );
  }

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const radius = Math.min(
      resolvedRadius,
      distance(previous, current) / 2,
      distance(current, next) / 2,
    );
    const before = moveToward(current, previous, radius);
    const after = moveToward(current, next, radius);
    path += ` L ${before[0]} ${before[1]} Q ${current[0]} ${current[1]} ${after[0]} ${after[1]}`;
  }

  const last = points.at(-1)!;
  return `${path} L ${last[0]} ${last[1]}`;
}

function routeToSatellite(point: PillarPoint): PillarPoint[] {
  const parent = satelliteParent(point);
  const parentPoint = coloredPoints[parent];
  const direction = point[1] < parentPoint[1] ? -1 : 1;
  const junctionY = (parentPoint[1] + point[1]) / 2;

  return [
    [parentPoint[0], parentPoint[1] + direction * 3],
    [parentPoint[0], junctionY],
    [point[0], junctionY],
    [point[0], point[1] - direction * 2.5],
  ];
}

function continuationRoute(point: PillarPoint): PillarPoint[] {
  const isTopNode = point[1] < coloredPoints.server[1];
  const nodeEdgeY = point[1] + (isTopNode ? -2.5 : 2.5);
  const canvasEdgeY = isTopNode ? 0 : 100;

  return isTopNode
    ? [[point[0], canvasEdgeY], [point[0], nodeEdgeY]]
    : [[point[0], nodeEdgeY], [point[0], canvasEdgeY]];
}

function satelliteParent(point: PillarPoint): CentralNode {
  return centralOrder.reduce((nearest, node) => (
    Math.abs(coloredPoints[node][0] - point[0])
      < Math.abs(coloredPoints[nearest][0] - point[0])
      ? node
      : nearest
  ));
}

function appendRoute(target: PillarPoint[], route: PillarPoint[]) {
  route.forEach((point) => {
    if (target.length === 0 || distance(target.at(-1)!, point) > 0.001) target.push(point);
  });
}

function centralTraversal(source: CentralNode, target: CentralNode) {
  const sourceIndex = centralOrder.indexOf(source);
  const targetIndex = centralOrder.indexOf(target);
  const direction = sourceIndex <= targetIndex ? 1 : -1;
  const route: PillarPoint[] = [coloredPoints[source]];
  let currentIndex = sourceIndex;

  while (currentIndex !== targetIndex) {
    currentIndex += direction;
    appendRoute(route, [coloredPoints[centralOrder[currentIndex]]]);
  }

  return route;
}

function completeBeamRoute(
  trace: BeamTrace,
  satellitePoints: PillarPoint[],
  showContinuationConnectors: boolean,
) {
  const targetPoint = satellitePoints[trace.targetIndex];
  const targetParent = satelliteParent(targetPoint);
  const sourcePoint = satellitePoints[trace.sourceIndex];
  const sourceParent = satelliteParent(sourcePoint);
  const route: PillarPoint[] = [];

  if (showContinuationConnectors) {
    appendRoute(route, continuationRoute(sourcePoint));
  }
  appendRoute(route, [sourcePoint]);
  appendRoute(route, [...routeToSatellite(sourcePoint)].reverse());
  appendRoute(route, [coloredPoints[sourceParent]]);
  appendRoute(route, centralTraversal(sourceParent, targetParent));
  appendRoute(route, [coloredPoints[targetParent]]);
  appendRoute(route, routeToSatellite(targetPoint));
  appendRoute(route, [targetPoint]);
  if (showContinuationConnectors) {
    appendRoute(route, continuationRoute(targetPoint));
  }

  return route;
}

function beamArrivalPoints(
  trace: BeamTrace,
  satellitePoints: PillarPoint[],
  showContinuationConnectors: boolean,
) {
  const sourcePoint = satellitePoints[trace.sourceIndex];
  const sourceParent = satelliteParent(sourcePoint);
  const targetPoint = satellitePoints[trace.targetIndex];
  const targetParent = satelliteParent(targetPoint);

  return [
    ...(showContinuationConnectors ? [sourcePoint] : []),
    ...centralTraversal(sourceParent, targetParent),
    targetPoint,
  ];
}

function initialBeamTrace(
  slot: number,
  sourceIndexes: number[],
  targetIndexes: number[],
): BeamTrace {
  const sourceIndex = sourceIndexes[(slot * 7) % sourceIndexes.length];
  const targetIndex = targetIndexes[(slot * 3 + 1) % targetIndexes.length];

  return {
    generation: 0,
    sourceIndex,
    targetIndex,
  };
}

function randomBeamTrace(
  sourceIndexes: number[],
  targetIndexes: number[],
  previous: BeamTrace,
): BeamTrace {
  const sourceIndex = sourceIndexes[Math.floor(Math.random() * sourceIndexes.length)];
  let targetIndex = targetIndexes[Math.floor(Math.random() * targetIndexes.length)];
  const nextGeneration = previous.generation + 1;

  if (
    sourceIndex === previous.sourceIndex
    && targetIndex === previous.targetIndex
  ) {
    const previousTargetPosition = targetIndexes.indexOf(targetIndex);
    targetIndex = targetIndexes[(previousTargetPosition + 1) % targetIndexes.length];
  }

  return {
    generation: nextGeneration,
    sourceIndex,
    targetIndex,
  };
}

function screenSegmentLength(from: PillarPoint, to: PillarPoint) {
  const deltaX = to[0] - from[0];
  const deltaY = (to[1] - from[1]) * 1.9;
  return Math.hypot(deltaX, deltaY);
}

function approximateScreenLength(route: PillarPoint[]) {
  return route.slice(1).reduce((length, point, index) => {
    return length + screenSegmentLength(route[index], point);
  }, 0);
}

function continuationEdgeOpacity(y: number) {
  const distanceFromEdge = Math.min(y, 100 - y);
  const progress = Math.min(
    1,
    Math.max(0, distanceFromEdge / continuationFadeBoundary),
  );

  return progress * progress * (3 - 2 * progress);
}

function routeProgressAtPoint(route: PillarPoint[], arrivalPoint: PillarPoint) {
  const arrivalIndex = route.findIndex((point) => distance(point, arrivalPoint) < 0.001);
  const totalLength = approximateScreenLength(route);

  if (arrivalIndex <= 0 || totalLength === 0) return 0;
  return approximateScreenLength(route.slice(0, arrivalIndex + 1)) / totalLength;
}

function createBeamRun(
  trace: BeamTrace,
  satellitePoints: PillarPoint[],
  slot: number,
  speed: number,
  showContinuationConnectors: boolean,
  emissionRandomness: number,
): BeamRun {
  const route = completeBeamRoute(
    trace,
    satellitePoints,
    showContinuationConnectors,
  );
  const duration = Math.min(
    4.3,
    Math.max(1.5, approximateScreenLength(route) / 42),
  ) / speed;

  return {
    arrivals: beamArrivalPoints(
      trace,
      satellitePoints,
      showContinuationConnectors,
    ),
    duration,
    initialDelay: emissionDelay(trace, slot, emissionRandomness),
    route,
    trace,
  };
}

function PillarsBeam({
  beamColor,
  beamEmissionRandomness,
  beamHeadGlowBlur,
  beamHeadGlowOpacity,
  beamHeadGlowRadius,
  beamHighlightColor,
  beamTrailLength,
  burstFadeTime,
  burstRadius,
  burstStrength,
  connectorRadius,
  satellitePoints,
  slot,
  sourceIndexes,
  speed,
  targetIndexes,
  showContinuationConnectors,
  width,
}: PillarsBeamProps) {
  const trailGradientId = `beam-trail-${useId().replaceAll(':', '')}`;
  const guidePathRef = useRef<SVGPathElement>(null);
  const orbRef = useRef<HTMLSpanElement>(null);
  const trailGradientRef = useRef<SVGLinearGradientElement>(null);
  const trailPathRef = useRef<SVGPathElement>(null);
  const completionRef = useRef<() => void>(() => undefined);
  const [beamState, setBeamState] = useState<BeamState>(() => {
    const initialTrace = initialBeamTrace(slot, sourceIndexes, targetIndexes);
    const initialRun = createBeamRun(
      initialTrace,
      satellitePoints,
      slot,
      speed,
      showContinuationConnectors,
      beamEmissionRandomness,
    );

    return {
      activeRun: initialRun,
      burstRuns: [initialRun],
    };
  });
  const path = roundedPolylinePath(beamState.activeRun.route, connectorRadius);
  const resolvedHeadGlowBlur = Math.max(0, beamHeadGlowBlur);
  const resolvedHeadGlowOpacity = Math.min(1, Math.max(0, beamHeadGlowOpacity));
  const resolvedHeadGlowRadius = Math.max(0, beamHeadGlowRadius);
  const beamOrbStyle: BeamOrbStyle = {
    '--beam-color': beamColor,
    '--beam-glow-large': `${Math.max(10, width * 12)}px`,
    '--beam-glow-small': `${Math.max(4, width * 4)}px`,
    '--beam-head-glow-blur': `${resolvedHeadGlowBlur}px`,
    '--beam-head-glow-opacity': String(resolvedHeadGlowOpacity),
    '--beam-head-glow-radius': `${resolvedHeadGlowRadius}px`,
    '--beam-highlight': beamHighlightColor,
    '--beam-size': `${Math.max(3, width * 2.4)}px`,
  };
  const advanceBeam = useCallback(() => {
    setBeamState((current) => {
      const nextTrace = randomBeamTrace(
        sourceIndexes,
        targetIndexes,
        current.activeRun.trace,
      );
      const nextRun = createBeamRun(
        nextTrace,
        satellitePoints,
        slot,
        speed,
        showContinuationConnectors,
        beamEmissionRandomness,
      );

      return {
        activeRun: nextRun,
        burstRuns: [...current.burstRuns, nextRun],
      };
    });
  }, [beamEmissionRandomness, satellitePoints, showContinuationConnectors, slot, sourceIndexes, speed, targetIndexes]);
  const finishBurstRun = useCallback((generation: number) => {
    setBeamState((current) => ({
      ...current,
      burstRuns: current.burstRuns.filter(
        (run) => run.trace.generation !== generation,
      ),
    }));
  }, []);

  useEffect(() => {
    completionRef.current = advanceBeam;
  }, [advanceBeam]);

  useEffect(() => {
    const guidePath = guidePathRef.current;
    const orb = orbRef.current;
    const trailGradient = trailGradientRef.current;
    const trailPath = trailPathRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!guidePath || !orb || !trailGradient || !trailPath || reducedMotion) return undefined;

    const totalLength = guidePath.getTotalLength();
    const resolvedTrailLength = Math.min(totalLength, Math.max(0, beamTrailLength));
    const delay = beamState.activeRun.initialDelay * 1000;
    const duration = beamState.activeRun.duration * 1000;
    let animationFrame = 0;
    let startedAt: number | undefined;

    const renderFrame = (timestamp: number) => {
      startedAt ??= timestamp;
      const elapsed = timestamp - startedAt - delay;

      if (elapsed < 0) {
        orb.style.opacity = '0';
        trailPath.style.opacity = '0';
        animationFrame = window.requestAnimationFrame(renderFrame);
        return;
      }

      const progress = Math.min(1, elapsed / duration);
      const headLength = totalLength * progress;
      const point = guidePath.getPointAtLength(headLength);
      const visibleTrailLength = Math.min(resolvedTrailLength, headLength);
      const trailStart = headLength - visibleTrailLength;
      const edgeOpacity = showContinuationConnectors
        ? continuationEdgeOpacity(point.y)
        : 1;

      orb.style.left = `${point.x}%`;
      orb.style.top = `${point.y}%`;
      orb.style.opacity = String(edgeOpacity);
      if (visibleTrailLength > 0) {
        const sampleCount = Math.max(1, Math.ceil(visibleTrailLength / 2));
        const tailPoint = guidePath.getPointAtLength(trailStart);
        const trail = Array.from({ length: sampleCount + 1 }, (_, index) => {
          const sample = guidePath.getPointAtLength(
            trailStart + (visibleTrailLength * index) / sampleCount,
          );
          return `${index === 0 ? 'M' : 'L'} ${sample.x} ${sample.y}`;
        }).join(' ');
        trailPath.setAttribute('d', trail);
        trailGradient.setAttribute('x1', String(tailPoint.x));
        trailGradient.setAttribute('y1', String(tailPoint.y));
        trailGradient.setAttribute('x2', String(point.x));
        trailGradient.setAttribute('y2', String(point.y));
      }
      trailPath.style.opacity = visibleTrailLength > 0 ? String(edgeOpacity) : '0';

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(renderFrame);
        return;
      }

      // Keep the completed beam on its leaf for one painted frame. The next
      // route is created only after the beam has visibly reached its target.
      animationFrame = window.requestAnimationFrame(() => completionRef.current());
    };

    animationFrame = window.requestAnimationFrame(renderFrame);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [beamState.activeRun, beamTrailLength, showContinuationConnectors]);

  return (
    <>
      <svg
        className={styles.connectors}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={trailGradientId}
            ref={trailGradientRef}
          >
            <stop offset="0" stopColor={beamColor} stopOpacity="0" />
            <stop offset="0.58" stopColor={beamColor} stopOpacity="0.28" />
            <stop offset="1" stopColor={beamColor} stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <path ref={guidePathRef} d={path} fill="none" />
        <path
          className={styles.beamTrail}
          d={path}
          fill="none"
          ref={trailPathRef}
          stroke={`url(#${trailGradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={Math.max(1.25, width * 1.4)}
          style={{ filter: `drop-shadow(0 0 ${Math.max(4, width * 4)}px ${beamColor})` }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden="true"
        className={styles.beamOrb}
        ref={orbRef}
        style={beamOrbStyle}
      />
      {beamState.burstRuns.map((run) => (
        <div
          className={styles.burstLayer}
          aria-hidden="true"
          key={run.trace.generation}
        >
          {run.arrivals.map((arrival, arrivalIndex) => {
            const burstStyle: BurstStyle = {
              '--burst-delay': `${run.initialDelay + run.duration * routeProgressAtPoint(run.route, arrival)}s`,
              '--burst-color': beamColor,
              '--burst-core-fade-time': `${burstFadeTime * (640 / 920)}ms`,
              '--burst-fade-time': `${burstFadeTime}ms`,
              '--burst-highlight': beamHighlightColor,
              '--burst-radius': `${burstRadius}px`,
              '--burst-strength': String(burstStrength),
              '--burst-x': `${arrival[0]}%`,
              '--burst-y': `${arrival[1]}%`,
            };
            const isFinalArrival = arrivalIndex === run.arrivals.length - 1;

            return (
              <span
                className={styles.nodeBurst}
                key={`${arrival[0]}-${arrival[1]}-${arrivalIndex}`}
                style={burstStyle}
              >
                <span
                  className={styles.nodeBurstGlow}
                  onAnimationEnd={isFinalArrival
                    ? () => finishBurstRun(run.trace.generation)
                    : undefined}
                />
                <span className={styles.nodeBurstCore} />
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function PillarsConnectors({
  beamColor = '#449c40',
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1,
  beamTrailLength = 0,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  color = '#ffffff',
  connectorRadius = 1.75,
  maxConcurrentBeams = Number.POSITIVE_INFINITY,
  opacity = 0.62,
  satellitePoints,
  showContinuationConnectors = false,
  width = 1.25,
}: PillarsConnectorsProps) {
  const satelliteRoutes = satellitePoints.map(routeToSatellite);
  const continuationRoutes = showContinuationConnectors
    ? satellitePoints.map(continuationRoute)
    : [];
  const routes = [...coloredRoutes, ...satelliteRoutes];
  const resolvedBeamEmissionRandomness = Math.min(100, Math.max(0, beamEmissionRandomness));
  const resolvedBeamSpeed = Math.max(0.1, beamSpeed);
  const resolvedBeamTrailLength = Math.max(0, beamTrailLength);
  const resolvedBurstFadeTime = Math.max(1, burstFadeTime);
  const resolvedBurstRadius = Math.max(0, burstRadius);
  const resolvedBurstStrength = Math.max(0, burstStrength);
  const sourceIndexes = satellitePoints.flatMap((point, index) => (
    point[1] < 50 ? [index] : []
  ));
  const targetIndexes = satellitePoints.flatMap((point, index) => (
    point[1] > 50 ? [index] : []
  ));
  const hasCompleteRoute = sourceIndexes.length > 0 && targetIndexes.length > 0;
  const beamCount = beamEnabled && hasCompleteRoute
    ? Math.min(satellitePoints.length, Math.max(0, Math.floor(maxConcurrentBeams)))
    : 0;
  return (
    <>
      <svg
        className={styles.connectors}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {routes.map((route, index) => {
          const path = roundedPolylinePath(route, connectorRadius);

          return (
            <path
              className={styles.connector}
              d={path}
              fill="none"
              key={`${route[0].join('-')}-${route.at(-1)!.join('-')}-${index}`}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={opacity}
              strokeWidth={width}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {showContinuationConnectors ? (
        <svg
          className={`${styles.connectors} ${styles.continuationFade}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {continuationRoutes.map((route, index) => (
            <path
              className={styles.connector}
              d={roundedPolylinePath(route, connectorRadius)}
              fill="none"
              key={`${route[0].join('-')}-${route.at(-1)!.join('-')}-${index}`}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={opacity}
              strokeWidth={width}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      ) : null}
      {Array.from({ length: beamCount }, (_, slot) => (
        <PillarsBeam
          beamColor={beamColor}
          beamEmissionRandomness={resolvedBeamEmissionRandomness}
          beamHeadGlowBlur={beamHeadGlowBlur}
          beamHeadGlowOpacity={beamHeadGlowOpacity}
          beamHeadGlowRadius={beamHeadGlowRadius}
          beamHighlightColor={beamHighlightColor}
          beamTrailLength={resolvedBeamTrailLength}
          burstFadeTime={resolvedBurstFadeTime}
          burstRadius={resolvedBurstRadius}
          burstStrength={resolvedBurstStrength}
          connectorRadius={connectorRadius}
          key={`${slot}:${showContinuationConnectors}`}
          satellitePoints={satellitePoints}
          showContinuationConnectors={showContinuationConnectors}
          slot={slot}
          sourceIndexes={sourceIndexes}
          speed={resolvedBeamSpeed}
          targetIndexes={targetIndexes}
          width={width}
        />
      ))}
    </>
  );
}
