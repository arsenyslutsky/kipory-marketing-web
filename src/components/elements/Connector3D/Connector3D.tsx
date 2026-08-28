'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { businessFlowPalette } from '@/features/business-flow-palette';
import { createConnector3DScene } from './createConnector3DScene';
import styles from './Connector3D.module.css';
import type { Connector3DProps, Connector3DSceneOptions } from './types';

const defaultPath = {
  points: [
    [-4.2, 0, -2.1],
    [-4.2, 0, 1.1],
    [4.2, 0, 1.1],
    [4.2, 0, 2.8],
  ],
  interpolation: 'smooth',
} as const;

type Connector3DStyle = CSSProperties & {
  '--connector-3d-height': string;
  '--connector-3d-width': string;
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

export function Connector3D({
  cameraPitch = 33.19,
  cameraYaw = 0,
  cameraZoom = 1,
  className,
  color = businessFlowPalette.connector,
  connectorWidth = 1,
  direction = 'forward',
  fading = false,
  height = '28rem',
  interactive = true,
  opacity = 0.32,
  path = defaultPath,
  pathCurve = 38,
  perspectiveEffect = 75,
  stroke = 'dashed',
  width = 'min(100%, 48rem)',
}: Connector3DProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let active = true;
    let controller: ReturnType<typeof createConnector3DScene> | undefined;
    queueMicrotask(() => {
      if (active) setError('');
    });
    try {
      const options: Connector3DSceneOptions = {
        cameraPitch,
        cameraYaw,
        cameraZoom,
        color,
        connectorWidth,
        direction,
        elements: {
          canvas: canvasRef.current,
          container: containerRef.current,
        },
        fading,
        interactive,
        opacity,
        path,
        pathCurve,
        perspectiveEffect,
        stroke,
      };
      controller = createConnector3DScene(options);
    } catch (sceneError) {
      const message = sceneError instanceof Error ? sceneError.message : 'Unable to render Connector3D.';
      queueMicrotask(() => {
        if (active) setError(message);
      });
    }

    return () => {
      active = false;
      controller?.destroy();
    };
  }, [
    cameraPitch,
    cameraYaw,
    cameraZoom,
    color,
    connectorWidth,
    direction,
    fading,
    interactive,
    opacity,
    path,
    pathCurve,
    perspectiveEffect,
    stroke,
  ]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const style: Connector3DStyle = {
    '--connector-3d-height': cssSize(height),
    '--connector-3d-width': cssSize(width),
  };

  return (
    <figure
      ref={containerRef}
      className={rootClassName}
      style={style}
      role="img"
      aria-label={`Three-dimensional ${stroke} business-flow connector`}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      {error && <div className={styles.fallback} role="alert">{error}</div>}
    </figure>
  );
}

export type { Connector3DProps, Connector3DStroke } from './types';
