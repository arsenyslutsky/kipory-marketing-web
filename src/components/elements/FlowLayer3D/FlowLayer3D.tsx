'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { getBusinessFlowPalette } from '@/features/business-flow-palette';
import { FlowLoadingOverlay } from '@/components/elements/FlowLoadingOverlay/FlowLoadingOverlay';
import { useResolvedTheme } from '@/theme/ThemeProvider';
import { useWorkflowRuntime } from '../workflow-runtime';
import styles from './FlowLayer3D.module.css';
import type { FlowLayer3DNode, FlowLayer3DProps, FlowLayer3DSceneController } from './types';

const emptyNodes: readonly FlowLayer3DNode[] = [];

export function FlowLayer3D({
  activityStrategy,
  beam,
  beamSource,
  className,
  connector,
  loadStrategy,
  mode: explicitMode,
  nodes,
  nodeStyle,
  onActivityChange,
  onArrival,
  paths,
  preloadMargin,
  reducedMotion,
  resolutionScale,
  worldHeight,
}: FlowLayer3DProps) {
  const mode = useResolvedTheme(nodeStyle?.mode ?? explicitMode);
  const palette = getBusinessFlowPalette(mode);
  const resolvedNodeStyle = useMemo(() => nodeStyle ? {
    ...nodeStyle,
    mode,
  } : undefined, [mode, nodeStyle]);
  const flowNodes = nodes ?? emptyNodes;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<FlowLayer3DSceneController | undefined>(undefined);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const runtime = useWorkflowRuntime(containerRef, {
    activityStrategy,
    loadStrategy,
    preloadMargin,
    resolutionScale,
  });
  const runtimeActiveRef = useRef(runtime.active);

  useEffect(() => {
    runtimeActiveRef.current = runtime.active;
    controllerRef.current?.setActive(runtime.active);
    onActivityChange?.(runtime.active);
  }, [onActivityChange, runtime.active]);

  useEffect(() => {
    if (!runtime.shouldInitialize) return undefined;
    if (!containerRef.current || !canvasRef.current || !cssLayerRef.current) return undefined;
    let mounted = true;
    let controller: FlowLayer3DSceneController | undefined;
    queueMicrotask(() => {
      if (mounted) {
        setError('');
        setReady(false);
      }
    });
    const reportError = (error: unknown) => {
      if (process.env.NODE_ENV !== 'production') console.error(error);
      const message = error instanceof Error ? error.message : 'Unable to render FlowLayer3D.';
      queueMicrotask(() => {
        if (mounted) setError(message);
      });
    };
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const cssLayer = cssLayerRef.current;
    void import('./createFlowLayer3DScene').then(({ createFlowLayer3DScene }) => {
      if (!mounted) return;
      try {
        controller = createFlowLayer3DScene({
          active: false,
          beam,
          beamSource,
          canvas,
          connector,
          container,
          cssLayer,
          mode,
          nodes: flowNodes,
          nodeStyle: resolvedNodeStyle,
          onArrival,
          onError: reportError,
          onReady: () => {
            if (mounted) setReady(true);
          },
          paths,
          reducedMotion,
          resolutionScale,
          worldHeight,
        });
        controllerRef.current = controller;
        controller.setActive(runtimeActiveRef.current);
      } catch (error) {
        reportError(error);
      }
    }, reportError);
    return () => {
      mounted = false;
      if (controllerRef.current === controller) controllerRef.current = undefined;
      controller?.destroy();
    };
  }, [
    beam,
    beamSource,
    connector,
    flowNodes,
    mode,
    onArrival,
    paths,
    reducedMotion,
    resolutionScale,
    runtime.shouldInitialize,
    resolvedNodeStyle,
    worldHeight,
  ]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const flowState = error
    ? 'error'
    : !runtime.shouldInitialize
      ? 'deferred'
      : ready
        ? 'ready'
        : 'loading';
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={rootClassName}
      data-flow-state={flowState}
      data-mode={mode}
    >
      {runtime.shouldInitialize && (
        <>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div ref={cssLayerRef} className={styles.cssLayer} data-flow-layer-css3d />
        </>
      )}
      <FlowLoadingOverlay active={flowState === 'loading'} />
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
                '--flow-node-body-end': resolvedNodeStyle?.frontGradient.end ?? palette.frontGradient.end,
                '--flow-node-body-mid': resolvedNodeStyle?.frontGradient.mid ?? palette.frontGradient.mid,
                '--flow-node-body-start': resolvedNodeStyle?.frontGradient.start ?? palette.frontGradient.start,
                '--flow-node-height': `${node.cardDepth}px`,
                '--flow-node-icon-color': node.iconStrokeColor ?? palette.iconStroke,
                '--flow-node-icon-opacity': String(Math.min(1, Math.max(0, node.iconOpacity))),
                '--flow-node-radius': `${Math.max(2, Math.min(
                  resolvedNodeStyle?.nodeCornerRadius ?? 8,
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
                  '--flow-node-icon': `url("${(resolvedNodeStyle?.assetBasePath ?? '/assets/nodes').replace(/\/$/, '')}/${node.icon}")`,
                } as CSSProperties}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
