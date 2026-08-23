'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cssVariablesForTheme, defaultColors, defaultFlow } from '../config';
import { createSignalFlowScene, type SignalFlowSceneController } from '../scene/createSignalFlowScene';
import type { SignalFlowIllustrationProps, SignalFlowMode } from '../types';
import styles from './SignalFlowIllustration.module.css';

const content = {
  eyebrow: 'OBSERVABILITY LAYER',
  title: 'Follow the pulse',
  accent: 'through the network.',
  description: 'A live system view built for continuous monitoring. Every path is traceable and never quite the same twice.',
  routeLabel: 'LIVE TRACE',
  action: 'GENERATE NEW TRACE',
  status: 'NETWORK ACTIVE',
  hint: 'DRAG TO ORBIT',
} as const;

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SignalFlowIllustration({
  variant = 'variant-2',
  mode = 'light',
  flow = defaultFlow,
  colors = defaultColors,
  assetBasePath = '/assets/nodes',
  className,
  showInterface = true,
  gridOpacity,
  gridDensity = 30,
  connectorOpacity = mode === 'dark' ? 0.92 : 0.82,
  connectorStroke = 'solid',
  connectorWidth = 2,
  pathCurve = 0,
  outlineOpacity = 1,
  outlineWidth = 3,
  nodeDepth = 12,
  nodeCornerRadius = 10,
  perspectiveEffect = 0,
  cameraPitch = 45,
  cameraYaw,
  cameraZoom = 1,
  scrollTilt = 0,
  scrollZoom,
  scrollRange = 700,
  minDelay = 0,
  maxDelay = 0,
  progressBarHeight = 8,
  concurrentBeams = 1,
  minEmitDelay = 0,
  maxEmitDelay = 0,
  reducedMotion,
  onModeChange,
}: SignalFlowIllustrationProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<HTMLDivElement>(null);
  const routeIdRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<SignalFlowSceneController | null>(null);
  const [error, setError] = useState('');
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
    if (!containerRef.current || !canvasRef.current || !cssLayerRef.current) return;
    let active = true;
    queueMicrotask(() => { if (active) setError(''); });
    try {
      controllerRef.current = createSignalFlowScene({
        variant,
        mode,
        flow,
        theme,
        assetBasePath,
        gridOpacity: resolvedGridOpacity,
        gridDensity,
        connectorOpacity,
        connectorStroke,
        connectorWidth,
        pathCurve,
        outlineOpacity,
        outlineWidth,
        nodeDepth,
        nodeCornerRadius,
        perspectiveEffect,
        cameraPitch,
        cameraYaw,
        cameraZoom,
        minDelay,
        maxDelay,
        progressBarHeight,
        concurrentBeams,
        minEmitDelay,
        maxEmitDelay,
        reducedMotion: reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        elements: {
          container: containerRef.current,
          canvas: canvasRef.current,
          cssLayer: cssLayerRef.current,
          routeLine: routeLineRef.current,
          routeId: routeIdRef.current,
          progressBar: progressBarRef.current,
        },
      });
    } catch (sceneError) {
      const message = sceneError instanceof Error ? sceneError.message : 'WebGL is unavailable.';
      queueMicrotask(() => { if (active) setError(message); });
    }
    return () => {
      active = false;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [assetBasePath, cameraPitch, cameraYaw, cameraZoom, concurrentBeams, connectorOpacity, connectorStroke, connectorWidth, flow, gridDensity, maxDelay, maxEmitDelay, minDelay, minEmitDelay, mode, nodeCornerRadius, nodeDepth, outlineOpacity, outlineWidth, pathCurve, perspectiveEffect, progressBarHeight, reducedMotion, resolvedGridOpacity, theme, variant]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || (scrollTilt === 0 && scrollZoom === undefined)) return;

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
        return;
      }

      const elapsed = lastFrameTime === 0 ? 1 / 60 : Math.min((frameTime - lastFrameTime) / 1000, 0.05);
      const damping = 1 - Math.exp(-14 * elapsed);
      displayedProgress += (targetProgress - displayedProgress) * damping;
      if (Math.abs(targetProgress - displayedProgress) < 0.0005) displayedProgress = targetProgress;
      lastFrameTime = frameTime;

      const eased = displayedProgress * displayedProgress * (3 - 2 * displayedProgress);
      const tilt = scrollTilt * eased;
      const roll = -1.2 * eased;
      const lift = -42 * eased;
      const resolvedScrollZoom = scrollZoom === undefined
        ? cameraZoom
        : cameraZoom + (scrollZoom - cameraZoom) * eased;

      element.style.transform = `perspective(1400px) rotateX(${tilt}deg) rotateZ(${roll}deg) translate3d(0, ${lift}px, 0)`;
      controllerRef.current?.setCameraZoom(resolvedScrollZoom);

      if (displayedProgress !== targetProgress) {
        frameId = window.requestAnimationFrame(renderScrollTransform);
      } else {
        lastFrameTime = 0;
      }
    };

    const updateScrollTarget = () => {
      targetProgress = readProgress();
      if (!frameId) frameId = window.requestAnimationFrame(renderScrollTransform);
    };

    element.style.transformOrigin = '62% 42%';
    element.style.willChange = 'transform';
    updateScrollTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', updateScrollTarget);
    reducedMotionQuery.addEventListener('change', updateScrollTarget);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateScrollTarget);
      reducedMotionQuery.removeEventListener('change', updateScrollTarget);
      controllerRef.current?.setCameraZoom(cameraZoom);
      element.style.removeProperty('transform');
      element.style.removeProperty('transform-origin');
      element.style.removeProperty('will-change');
    };
  }, [cameraZoom, reducedMotion, scrollRange, scrollTilt, scrollZoom]);

  const selectMode = (nextMode: SignalFlowMode) => {
    if (nextMode !== mode) onModeChange?.(nextMode);
  };

  const modeClass = mode === 'dark' ? styles.dark : styles.light;

  return (
    <section
      ref={containerRef}
      className={joinClasses(styles.root, styles.variant2, modeClass, className)}
      style={cssVariables}
      data-variant={variant}
      data-mode={mode}
      aria-label={`Signal flow ${variant.replace('-', ' ')}, ${mode} mode`}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={cssLayerRef} className={styles.svgLayer} aria-hidden="true" />

      {showInterface && (
        <>
          <header className={styles.topbar}>
            <div className={styles.brand}>
              <span className={styles.brandMark}><i /><i /><i /></span>
              <span>SIGNAL FLOW</span>
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

          <aside className={styles.routeCard} aria-live="polite">
            <div className={styles.routeHead}>
              <span>{copy.routeLabel}</span>
              <span ref={routeIdRef}>#001</span>
            </div>
            <div ref={routeLineRef} className={styles.routeLine}>LOADING ROUTE</div>
            <div className={styles.routeProgress}><i ref={progressBarRef} /></div>
            <button type="button" className={styles.reroute} onClick={() => controllerRef.current?.reroute()}>
              <span>{copy.action}</span>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7.5a6 6 0 0 1 10.5-1.2L17 8M15 12.5a6 6 0 0 1-10.5 1.2L3 12M17 4v4h-4M3 16v-4h4" /></svg>
            </button>
          </aside>

          <div className={styles.status}><span>{nodeCount} NODES</span><span>{edgeCount} EDGES</span><span>24 FPS+</span></div>
          <div className={styles.hint}><span className={styles.mouse} /> {copy.hint}</div>
          <div className={styles.cornerIndex}>02</div>
        </>
      )}

      {error && <div className={styles.fallback} role="alert">{error}</div>}
    </section>
  );
}
