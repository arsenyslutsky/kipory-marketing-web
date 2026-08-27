'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';
import styles from './FlowLayer3D.module.css';
import type { FlowLayer3DProps, FlowLayer3DSceneController } from './types';

export function FlowLayer3D({
  beam,
  beamSource,
  className,
  connector,
  nodes = [],
  nodeStyle,
  onArrival,
  paths,
  reducedMotion,
  worldHeight,
}: FlowLayer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !cssLayerRef.current) return undefined;
    let active = true;
    let controller: FlowLayer3DSceneController | undefined;
    queueMicrotask(() => {
      if (active) setError('');
    });
    try {
      controller = createFlowLayer3DScene({
        beam,
        beamSource,
        canvas: canvasRef.current,
        connector,
        container: containerRef.current,
        cssLayer: cssLayerRef.current,
        nodes,
        nodeStyle,
        onArrival,
        paths,
        reducedMotion,
        worldHeight,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error(error);
      const message = error instanceof Error ? error.message : 'Unable to render FlowLayer3D.';
      queueMicrotask(() => {
        if (active) setError(message);
      });
    }
    return () => {
      active = false;
      controller?.destroy();
    };
  }, [beam, beamSource, connector, nodeStyle, nodes, onArrival, paths, reducedMotion, worldHeight]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  return (
    <div ref={containerRef} aria-hidden="true" className={rootClassName}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={cssLayerRef} className={styles.cssLayer} data-flow-layer-css3d />
      {error && (
        <div className={styles.fallbackLayer} data-testid="flow-layer-node-fallback">
          {nodes.map((node) => (
            <span
              className={styles.fallbackNode}
              key={node.id}
              style={{
                '--flow-node-aspect': String(node.width / node.cardDepth),
                '--flow-node-color': node.iconColor,
                '--flow-node-height': `${node.cardDepth}px`,
                '--flow-node-icon': `url("${(nodeStyle?.assetBasePath ?? '/assets/nodes').replace(/\/$/, '')}/${node.icon}")`,
                '--flow-node-width': `${node.width}px`,
                '--flow-node-x': `${node.position[0] * 100}%`,
                '--flow-node-y': `${node.position[1] * 100}%`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
