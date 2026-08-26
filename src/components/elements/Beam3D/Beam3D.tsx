'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createBeam3DScene } from './createBeam3DScene';
import styles from './Beam3D.module.css';
import type { Beam3DProps, Beam3DSceneOptions } from './types';

const defaultPath = {
  points: [
    [-4.2, 0, -2.1],
    [-4.2, 0, 1.1],
    [4.2, 0, 1.1],
    [4.2, 0, 2.8],
  ],
  curve: 64,
  interpolation: 'linear',
} as const;

type Beam3DStyle = CSSProperties & {
  '--beam-3d-height': string;
  '--beam-3d-width': string;
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

export function Beam3D({
  beamColor = '#449c40',
  beamWidth = 1,
  cameraPitch = 33.19,
  cameraYaw = 0,
  cameraZoom = 1,
  className,
  delayBeforeDissapear = 0,
  direction = 'forward',
  flareColor = '#ffffff',
  glowIntensity = 1,
  height = '28rem',
  highlightColor = '#c9ebc7',
  interactive = true,
  mode = 'dark',
  packetColor = '#f1fbf0',
  packetCoreShape = 'circle',
  packetCoreSize = 1,
  packetHaloBlur = 0,
  packetHaloColor = '#449c40',
  packetHaloSize = 1,
  packetShadow = 0,
  packetVisible = true,
  path = defaultPath,
  perspectiveEffect = 75,
  playing = true,
  progress = 0.62,
  softness = 0.05,
  speed = 1,
  startFade = 0,
  style = 'ribbon',
  trailLength = 0.38,
  visibility = 1,
  width = 'min(100%, 48rem)',
}: Beam3DProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let active = true;
    let controller: ReturnType<typeof createBeam3DScene> | undefined;
    queueMicrotask(() => {
      if (active) setError('');
    });
    try {
      const options: Beam3DSceneOptions = {
        beamColor,
        beamWidth,
        cameraPitch,
        cameraYaw,
        cameraZoom,
        delayBeforeDissapear,
        direction,
        elements: {
          canvas: canvasRef.current,
          container: containerRef.current,
        },
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
      };
      controller = createBeam3DScene(options);
    } catch (sceneError) {
      const message = sceneError instanceof Error ? sceneError.message : 'Unable to render Beam3D.';
      queueMicrotask(() => {
        if (active) setError(message);
      });
    }

    return () => {
      active = false;
      controller?.destroy();
    };
  }, [
    beamColor,
    beamWidth,
    cameraPitch,
    cameraYaw,
    cameraZoom,
    delayBeforeDissapear,
    direction,
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
  ]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const componentStyle: Beam3DStyle = {
    '--beam-3d-height': cssSize(height),
    '--beam-3d-width': cssSize(width),
  };

  return (
    <figure
      ref={containerRef}
      className={rootClassName}
      style={componentStyle}
      role="img"
      aria-label={`Three-dimensional ${style} beam traveling ${direction}`}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      {error && <div className={styles.fallback} role="alert">{error}</div>}
    </figure>
  );
}

export type { Beam3DMode, Beam3DProps, Beam3DStyle, PacketCoreShape } from './types';
