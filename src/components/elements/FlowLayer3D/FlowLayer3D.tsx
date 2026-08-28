'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { businessFlowPalette } from '@/features/business-flow-palette';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';
import styles from './FlowLayer3D.module.css';
import type { FlowLayer3DNode, FlowLayer3DProps, FlowLayer3DSceneController } from './types';

const emptyNodes: readonly FlowLayer3DNode[] = [];

export function FlowLayer3D({
  beam,
  beamSource,
  className,
  connector,
  nodes,
  nodeStyle,
  onArrival,
  paths,
  reducedMotion,
  worldHeight,
}: FlowLayer3DProps) {
  const flowNodes = nodes ?? emptyNodes;
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
    const reportError = (error: unknown) => {
      if (process.env.NODE_ENV !== 'production') console.error(error);
      const message = error instanceof Error ? error.message : 'Unable to render FlowLayer3D.';
      queueMicrotask(() => {
        if (active) setError(message);
      });
    };
    try {
      controller = createFlowLayer3DScene({
        beam,
        beamSource,
        canvas: canvasRef.current,
        connector,
        container: containerRef.current,
        cssLayer: cssLayerRef.current,
        nodes: flowNodes,
        nodeStyle,
        onArrival,
        onError: reportError,
        paths,
        reducedMotion,
        worldHeight,
      });
    } catch (error) {
      reportError(error);
    }
    return () => {
      active = false;
      controller?.destroy();
    };
  }, [beam, beamSource, connector, flowNodes, nodeStyle, onArrival, paths, reducedMotion, worldHeight]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  return (
    <div ref={containerRef} aria-hidden="true" className={rootClassName}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={cssLayerRef} className={styles.cssLayer} data-flow-layer-css3d />
      {error && (
        <div className={styles.fallbackLayer} data-testid="flow-layer-node-fallback">
          {flowNodes.map((node) => (
            <span
              className={styles.fallbackNode}
              data-flow-node-fallback-body
              data-flow-node-shape={node.shape}
              key={node.id}
              style={{
                '--flow-node-aspect': String(node.width / node.cardDepth),
                '--flow-node-body-end': nodeStyle?.frontGradient.end ?? businessFlowPalette.frontGradient.end,
                '--flow-node-body-mid': nodeStyle?.frontGradient.mid ?? businessFlowPalette.frontGradient.mid,
                '--flow-node-body-start': nodeStyle?.frontGradient.start ?? businessFlowPalette.frontGradient.start,
                '--flow-node-height': `${node.cardDepth}px`,
                '--flow-node-icon-color': node.iconStrokeColor ?? businessFlowPalette.iconStroke,
                '--flow-node-icon-opacity': String(Math.min(1, Math.max(0, node.iconOpacity))),
                '--flow-node-radius': `${Math.max(2, Math.min(
                  nodeStyle?.nodeCornerRadius ?? 8,
                  node.width / 2,
                  node.cardDepth / 2,
                ))}px`,
                '--flow-node-width': `${node.width}px`,
                '--flow-node-x': `${node.position[0] * 100}%`,
                '--flow-node-y': `${node.position[1] * 100}%`,
              } as CSSProperties}
            >
              <span
                className={styles.fallbackIcon}
                data-flow-node-fallback-icon
                style={{
                  '--flow-node-icon': `url("${(nodeStyle?.assetBasePath ?? '/assets/nodes').replace(/\/$/, '')}/${node.icon}")`,
                } as CSSProperties}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
