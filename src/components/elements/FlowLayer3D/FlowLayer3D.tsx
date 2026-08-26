'use client';

import { useEffect, useRef } from 'react';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';
import styles from './FlowLayer3D.module.css';
import type { FlowLayer3DProps, FlowLayer3DSceneController } from './types';

export function FlowLayer3D({
  beam,
  beamSource,
  className,
  connector,
  onArrival,
  paths,
  reducedMotion,
  worldHeight,
}: FlowLayer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return undefined;
    let controller: FlowLayer3DSceneController | undefined;
    try {
      controller = createFlowLayer3DScene({
        beam,
        beamSource,
        canvas: canvasRef.current,
        connector,
        container: containerRef.current,
        onArrival,
        paths,
        reducedMotion,
        worldHeight,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error(error);
    }
    return () => controller?.destroy();
  }, [beam, beamSource, connector, onArrival, paths, reducedMotion, worldHeight]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  return (
    <div ref={containerRef} aria-hidden="true" className={rootClassName}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
