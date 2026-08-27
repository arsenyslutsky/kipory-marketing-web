'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createNode3DScene } from './createNode3DScene';
import styles from './Node3D.module.css';
import type { Node3DProps, Node3DSceneOptions } from './types';

type Node3DStyle = CSSProperties & {
  '--node-3d-height': string;
  '--node-3d-width': string;
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

export function Node3D({
  assetBasePath = '/assets/nodes',
  cameraPitch = 33.19,
  cameraYaw = 28,
  cameraZoom = 1,
  className,
  depth = 2.2,
  floating = true,
  frontGradientAngle = 117,
  frontGradientEndColor = '#052f24',
  frontGradientMidColor = '#03492b',
  frontGradientStartColor = '#066b43',
  glowIntensity = 0.55,
  height = '38rem',
  icon = 'hexagon_default.svg',
  iconColor,
  iconOpacity = 0.5,
  iconStrokeOpacity,
  iconStrokeWidth,
  interactive = true,
  mode = 'dark',
  nodeCornerRadius = 10,
  nodeDepth = 20,
  nodeScale = 1,
  nodeWidth = 4.3,
  outlineOpacity = 0,
  outlineWidth = 1,
  perspectiveEffect = 75,
  progress = 0.64,
  progressBarHeight = 15,
  progressMode = 'outline',
  progressPadding = 1,
  shape = 'hexagon',
  showProgress = true,
  sideXGradientAngle = 360,
  sideXGradientEndColor = '#5c899b',
  sideXGradientMidColor = '#10402e',
  sideXGradientStartColor = '#31775a',
  sideZGradientAngle = 177,
  sideZGradientEndColor = '#0e4b81',
  sideZGradientMidColor = '#366480',
  sideZGradientStartColor = '#427298',
  width = 'min(100%, 48rem)',
}: Node3DProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !cssLayerRef.current) return;

    let active = true;
    let controller: ReturnType<typeof createNode3DScene> | undefined;
    queueMicrotask(() => {
      if (active) setError('');
    });
    try {
      const options: Node3DSceneOptions = {
        assetBasePath,
        cameraPitch,
        cameraYaw,
        cameraZoom,
        depth,
        elements: {
          canvas: canvasRef.current,
          container: containerRef.current,
          cssLayer: cssLayerRef.current,
        },
        floating,
        frontGradientAngle,
        frontGradientEndColor,
        frontGradientMidColor,
        frontGradientStartColor,
        glowIntensity,
        icon,
        iconColor,
        iconOpacity,
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
      };
      controller = createNode3DScene(options);
    } catch (sceneError) {
      const message = sceneError instanceof Error ? sceneError.message : 'Unable to render Node3D.';
      queueMicrotask(() => {
        if (active) setError(message);
      });
    }

    return () => {
      active = false;
      controller?.destroy();
    };
  }, [
    assetBasePath,
    cameraPitch,
    cameraYaw,
    cameraZoom,
    depth,
    floating,
    frontGradientAngle,
    frontGradientEndColor,
    frontGradientMidColor,
    frontGradientStartColor,
    glowIntensity,
    icon,
    iconColor,
    iconOpacity,
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
  ]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const style: Node3DStyle = {
    '--node-3d-height': cssSize(height),
    '--node-3d-width': cssSize(width),
  };

  return (
    <figure
      ref={containerRef}
      className={rootClassName}
      style={style}
      role="img"
      aria-label={`Three-dimensional ${shape} business-flow node`}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={cssLayerRef} className={styles.cssLayer} aria-hidden="true" />
      {error && <div className={styles.fallback} role="alert">{error}</div>}
    </figure>
  );
}

export type { Node3DMode, Node3DProgressMode, Node3DProps, Node3DShape } from './types';
