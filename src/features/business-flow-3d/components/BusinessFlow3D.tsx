'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FlowLoadingOverlay } from '@/components/elements/FlowLoadingOverlay/FlowLoadingOverlay';
import { useWorkflowRuntime } from '@/components/elements/workflow-runtime';
import { useScrollMotion } from '@/components/motion/ScrollMotionContext';
import { useResolvedTheme } from '@/theme/ThemeProvider';
import { cssVariablesForTheme, defaultColors, defaultFlow } from '../config';
import type { SignalFlowSceneController } from '../scene/createSignalFlowScene';
import { loadSignalFlowSceneFactory } from '../scene/loadSignalFlowScene';
import type { BusinessFlow3DProps, SignalFlowMode } from '../types';
import styles from './BusinessFlow3D.module.css';

const content = {
  eyebrow: 'OBSERVABILITY LAYER',
  title: 'Follow the pulse',
  accent: 'through the network.',
  description: 'A live system view built for continuous monitoring. Every path is traceable and never quite the same twice.',
  status: 'NETWORK ACTIVE',
  hint: 'DRAG TO ORBIT',
} as const;

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BusinessFlow3D({
  activityStrategy,
  variant = 'variant-2',
  mode: explicitMode,
  flow = defaultFlow,
  colors = defaultColors,
  assetBasePath = '/assets/nodes',
  className,
  showInterface = true,
  interactive = false,
  loadStrategy,
  gridOpacity,
  fogEnabled = true,
  gridDensity = 30,
  gridMaskRadius = 320,
  gridMaskBlur = 240,
  connectorOpacity: connectorOpacityProp,
  connectorStroke = 'solid',
  connectorWidth = 2,
  showContinuationConnectors = true,
  pathCurve = 0,
  outlineOpacity = 1,
  outlineWidth = 3,
  nodeScale = 1,
  nodeDepth = 12,
  nodeDepthRandom = 0,
  nodeShape = 'rectangle',
  nodeCornerRadius = 10,
  nodeIconOpacity: nodeIconOpacityProp,
  iconStrokeColor,
  nodeFrontGradientAngle = 32,
  nodeSideXGradientAngle = 18,
  nodeSideZGradientAngle = 18,
  nodeFrontGradientStartColor,
  nodeFrontGradientMidColor,
  nodeFrontGradientEndColor,
  nodeSideXGradientStartColor,
  nodeSideXGradientMidColor,
  nodeSideXGradientEndColor,
  nodeSideZGradientStartColor,
  nodeSideZGradientMidColor,
  nodeSideZGradientEndColor,
  perspectiveEffect = 0,
  cameraPitch = 45,
  cameraYaw,
  cameraZoom = 1,
  emitterX = 0.45,
  emitterY = -4.25,
  scrollTilt = 0,
  scrollZoom,
  scrollRange = 700,
  minDelay = 0,
  maxDelay = 0,
  speed = 1,
  nodeProgressMode = 'bar',
  nodeShadowBias,
  nodeShadowBlurSamples,
  nodeShadowColor,
  nodeShadowLightX,
  nodeShadowLightY,
  nodeShadowLightZ,
  nodeShadowNormalBias,
  nodeShadowOpacity,
  nodeShadowRadius,
  progressPadding = 1,
  progressBarHeight = 8,
  concurrentBeams = 1,
  minEmitDelay = 0,
  maxEmitDelay = 0,
  reducedMotion,
  preloadMargin,
  resolutionScale,
  onModeChange,
}: BusinessFlow3DProps) {
  const mode = useResolvedTheme(explicitMode);
  const connectorOpacity = connectorOpacityProp ?? (mode === 'dark' ? 0.92 : 0.82);
  const nodeIconOpacity = nodeIconOpacityProp ?? (mode === 'dark' ? 0.94 : 0.9);
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SignalFlowSceneController | null>(null);
  const runtimeActiveRef = useRef(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const runtime = useWorkflowRuntime(containerRef, {
    activityStrategy,
    loadStrategy,
    preloadMargin,
    resolutionScale,
  });
  const scrollMotion = useScrollMotion();
  const theme = colors[mode];
  const resolvedGridOpacity = gridOpacity ?? theme.scene.gridOpacity;
  const copy = content;
  const cssVariables = useMemo(() => cssVariablesForTheme(theme), [theme]);
  const hiddenNodes = new Set(flow.variants?.[variant]?.hiddenNodes || []);
  const nodeCount = flow.nodes.filter((node) => !hiddenNodes.has(node.id)).length;
  const edgeCount = Object.entries(flow.branches)
    .filter(([source]) => !hiddenNodes.has(source))
    .reduce((count, [, targets]) => count + targets.filter((target) => !hiddenNodes.has(target)).length, 0);

  useEffect(() => {
    runtimeActiveRef.current = runtime.active;
    controllerRef.current?.setActive(runtime.active);
  }, [runtime.active]);

  useEffect(() => {
    if (!runtime.shouldInitialize) return;
    if (!containerRef.current || !canvasRef.current || !cssLayerRef.current) return;
    let mounted = true;
    let controller: SignalFlowSceneController | undefined;
    queueMicrotask(() => {
      if (mounted) {
        setError('');
        setReady(false);
      }
    });
    const elements = {
      container: containerRef.current,
      canvas: canvasRef.current,
      cssLayer: cssLayerRef.current,
    };
    const reportError = (sceneError: unknown) => {
      const message = sceneError instanceof Error ? sceneError.message : 'WebGL is unavailable.';
      queueMicrotask(() => { if (mounted) setError(message); });
    };
    void loadSignalFlowSceneFactory().then((createSignalFlowScene) => {
      if (!mounted) return;
      try {
        controller = createSignalFlowScene({
        active: false,
        variant,
        mode,
        flow,
        theme,
        assetBasePath,
        interactive,
        gridOpacity: resolvedGridOpacity,
        fogEnabled,
        gridDensity,
        gridMaskRadius,
        gridMaskBlur,
        connectorOpacity,
        connectorStroke,
        connectorWidth,
        showContinuationConnectors,
        pathCurve,
        outlineOpacity,
        outlineWidth,
        nodeScale,
        nodeDepth,
        nodeDepthRandom,
        nodeShape,
        nodeCornerRadius,
        nodeIconOpacity,
        iconStrokeColor,
        nodeFrontGradientAngle,
        nodeSideXGradientAngle,
        nodeSideZGradientAngle,
        nodeFrontGradientStartColor,
        nodeFrontGradientMidColor,
        nodeFrontGradientEndColor,
        nodeSideXGradientStartColor,
        nodeSideXGradientMidColor,
        nodeSideXGradientEndColor,
        nodeSideZGradientStartColor,
        nodeSideZGradientMidColor,
        nodeSideZGradientEndColor,
        perspectiveEffect,
        cameraPitch,
        cameraYaw,
        cameraZoom,
        emitterX,
        emitterY,
        minDelay,
        maxDelay,
        speed,
        nodeProgressMode,
        nodeShadowBias,
        nodeShadowBlurSamples,
        nodeShadowColor,
        nodeShadowLightX,
        nodeShadowLightY,
        nodeShadowLightZ,
        nodeShadowNormalBias,
        nodeShadowOpacity,
        nodeShadowRadius,
        progressPadding,
        progressBarHeight,
        concurrentBeams,
        minEmitDelay,
        maxEmitDelay,
        reducedMotion: reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        resolutionScale,
        onReady: () => {
          if (mounted) setReady(true);
        },
        elements,
      });
        controllerRef.current = controller;
        controller.setActive(runtimeActiveRef.current);
      } catch (sceneError) {
        reportError(sceneError);
      }
    }, reportError);
    return () => {
      mounted = false;
      if (controllerRef.current === controller) controllerRef.current = null;
      controller?.destroy();
    };
  }, [assetBasePath, cameraPitch, cameraYaw, cameraZoom, concurrentBeams, connectorOpacity, connectorStroke, connectorWidth, emitterX, emitterY, flow, fogEnabled, gridDensity, gridMaskBlur, gridMaskRadius, iconStrokeColor, interactive, maxDelay, maxEmitDelay, minDelay, minEmitDelay, mode, nodeCornerRadius, nodeDepth, nodeDepthRandom, nodeFrontGradientAngle, nodeFrontGradientEndColor, nodeFrontGradientMidColor, nodeFrontGradientStartColor, nodeIconOpacity, nodeProgressMode, nodeScale, nodeShadowBias, nodeShadowBlurSamples, nodeShadowColor, nodeShadowLightX, nodeShadowLightY, nodeShadowLightZ, nodeShadowNormalBias, nodeShadowOpacity, nodeShadowRadius, nodeShape, nodeSideXGradientAngle, nodeSideXGradientEndColor, nodeSideXGradientMidColor, nodeSideXGradientStartColor, nodeSideZGradientAngle, nodeSideZGradientEndColor, nodeSideZGradientMidColor, nodeSideZGradientStartColor, outlineOpacity, outlineWidth, pathCurve, perspectiveEffect, progressBarHeight, progressPadding, reducedMotion, resolutionScale, resolvedGridOpacity, runtime.shouldInitialize, showContinuationConnectors, speed, theme, variant]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !runtime.active || (scrollTilt === 0 && scrollZoom === undefined)) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let lastFrameTime = 0;
    const readProgress = () => Math.min(Math.max(window.scrollY / Math.max(scrollRange, 1), 0), 1);
    let targetProgress = readProgress();
    let displayedProgress = targetProgress;

    const renderScrollTransform = (frameTime: number) => {
      frameId = 0;

      if (reducedMotion ?? reducedMotionQuery.matches) {
        displayedProgress = 0;
        targetProgress = 0;
        element.style.transform = 'none';
        controllerRef.current?.setCameraZoom(cameraZoom);
        element.style.removeProperty('will-change');
        return;
      }

      const elapsed = lastFrameTime === 0 ? 1 / 60 : Math.min((frameTime - lastFrameTime) / 1000, 0.05);
      const damping = 1 - Math.exp(-14 * elapsed);
      displayedProgress += (targetProgress - displayedProgress) * damping;
      if (Math.abs(targetProgress - displayedProgress) < 0.0005) displayedProgress = targetProgress;
      lastFrameTime = frameTime;

      const eased = displayedProgress * displayedProgress * (3 - 2 * displayedProgress);
      const tilt = scrollTilt * eased;
      const resolvedScrollZoom = scrollZoom === undefined
        ? cameraZoom
        : cameraZoom + (scrollZoom - cameraZoom) * eased;

      element.style.transform = `perspective(1400px) rotateX(${tilt}deg)`;
      controllerRef.current?.setCameraZoom(resolvedScrollZoom);

      if (displayedProgress !== targetProgress) {
        frameId = window.requestAnimationFrame(renderScrollTransform);
      } else {
        lastFrameTime = 0;
        element.style.removeProperty('will-change');
      }
    };

    const updateScrollTarget = (progress = readProgress()) => {
      targetProgress = progress;
      element.style.willChange = 'transform';
      if (!frameId) frameId = window.requestAnimationFrame(renderScrollTransform);
    };

    element.style.transformOrigin = '62% 42%';
    updateScrollTarget();
    const unsubscribe = scrollMotion?.subscribe(({ progress }) => updateScrollTarget(progress));
    const updateFromWindow = () => updateScrollTarget();
    const updateMotionPreference = () => updateScrollTarget();
    if (!scrollMotion) {
      window.addEventListener('scroll', updateFromWindow, { passive: true });
      window.addEventListener('resize', updateFromWindow);
    }
    reducedMotionQuery.addEventListener('change', updateMotionPreference);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      unsubscribe?.();
      window.removeEventListener('scroll', updateFromWindow);
      window.removeEventListener('resize', updateFromWindow);
      reducedMotionQuery.removeEventListener('change', updateMotionPreference);
      controllerRef.current?.setCameraZoom(cameraZoom);
      element.style.removeProperty('transform');
      element.style.removeProperty('transform-origin');
      element.style.removeProperty('will-change');
    };
  }, [cameraZoom, reducedMotion, runtime.active, scrollMotion, scrollRange, scrollTilt, scrollZoom]);

  const selectMode = (nextMode: SignalFlowMode) => {
    if (nextMode !== mode) onModeChange?.(nextMode);
  };

  const modeClass = mode === 'dark' ? styles.dark : styles.light;
  const flowState = error
    ? 'error'
    : !runtime.shouldInitialize
      ? 'deferred'
      : ready
        ? 'ready'
        : 'loading';

  return (
    <section
      ref={containerRef}
      className={joinClasses(styles.root, styles.variant2, modeClass, !interactive && styles.passive, className)}
      style={cssVariables}
      data-variant={variant}
      data-mode={mode}
      data-interactive={interactive}
      data-flow-state={flowState}
      aria-label={`Business flow 3D ${variant.replace('-', ' ')}, ${mode} mode`}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={cssLayerRef} className={styles.svgLayer} aria-hidden="true" />
      <FlowLoadingOverlay active={flowState === 'loading'} />

      {showInterface && (
        <>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <span className={styles.brandMark}><i /><i /><i /></span>
              <span>BUSINESS FLOW 3D</span>
            </div>
            <div className={styles.variantLabel}><span>02</span> VARIANT 2</div>
            <div className={styles.topMeta}>
              <nav className={styles.modeNav} aria-label="Color mode">
                {(['light', 'dark'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === mode}
                    onClick={() => selectMode(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </nav>
              <span className={styles.live}><i /> {copy.status}</span>
              <span className={styles.webglMeta}>WEBGL / 02</span>
            </div>
          </header>

          <section className={styles.intro}>
            <p className={styles.eyebrow}><span>02</span> {copy.eyebrow}</p>
            <h1>{copy.title}<br /><em>{copy.accent}</em></h1>
            <p className={styles.lede}>{copy.description}</p>
          </section>

          <div className={styles.status}><span>{nodeCount} NODES</span><span>{edgeCount} EDGES</span><span>24 FPS+</span></div>
          {interactive && <div className={styles.hint}><span className={styles.mouse} /> {copy.hint}</div>}
          <div className={styles.cornerIndex}>02</div>
        </>
      )}

      {error && <div className={styles.fallback} role="alert">{error}</div>}
    </section>
  );
}
