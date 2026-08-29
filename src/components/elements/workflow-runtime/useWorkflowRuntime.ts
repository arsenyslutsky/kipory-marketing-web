'use client';

import { useEffect, useState, type RefObject } from 'react';
import { workflowRuntimeDefaults, type WorkflowRuntimeOptions, type WorkflowRuntimeState } from './types';

export function useWorkflowRuntime<T extends Element>(
  ref: RefObject<T | null>,
  options: WorkflowRuntimeOptions = {},
): WorkflowRuntimeState {
  const activityStrategy = options.activityStrategy ?? workflowRuntimeDefaults.activityStrategy;
  const loadStrategy = options.loadStrategy ?? workflowRuntimeDefaults.loadStrategy;
  const preloadMargin = options.preloadMargin ?? workflowRuntimeDefaults.preloadMargin;
  const [state, setState] = useState<WorkflowRuntimeState>(() => {
    const shouldInitialize = loadStrategy === 'eager';
    return {
      active: shouldInitialize && activityStrategy === 'always'
        && (typeof document === 'undefined' || document.visibilityState !== 'hidden'),
      shouldInitialize,
    };
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let shouldInitialize = state.shouldInitialize || loadStrategy === 'eager';
    let inViewport = false;
    let documentVisible = document.visibilityState !== 'hidden';
    const observers: IntersectionObserver[] = [];

    const sync = () => {
      const active = shouldInitialize
        && documentVisible
        && (activityStrategy === 'always' || inViewport);
      setState((current) => (
        current.active === active && current.shouldInitialize === shouldInitialize
          ? current
          : { active, shouldInitialize }
      ));
    };

    if (typeof IntersectionObserver === 'undefined') {
      shouldInitialize = true;
      inViewport = true;
    } else {
      if (!shouldInitialize) {
        const preloadObserver = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          shouldInitialize = true;
          preloadObserver.disconnect();
          sync();
        }, { rootMargin: preloadMargin });
        preloadObserver.observe(element);
        observers.push(preloadObserver);
      }

      if (activityStrategy === 'visible') {
        const viewportObserver = new IntersectionObserver((entries) => {
          inViewport = entries.some((entry) => entry.isIntersecting);
          sync();
        });
        viewportObserver.observe(element);
        observers.push(viewportObserver);
      }
    }

    const handleVisibility = () => {
      documentVisible = document.visibilityState !== 'hidden';
      sync();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    sync();

    return () => {
      observers.forEach((observer) => observer.disconnect());
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [activityStrategy, loadStrategy, preloadMargin, ref, state.shouldInitialize]);

  return state;
}
