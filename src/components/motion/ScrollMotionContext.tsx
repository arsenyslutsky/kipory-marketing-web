'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

export type ScrollMotionSnapshot = {
  progress: number;
  timestamp: number;
};

export type ScrollMotionSubscription = {
  subscribe: (listener: (snapshot: ScrollMotionSnapshot) => void) => () => void;
};

const ScrollMotionContext = createContext<ScrollMotionSubscription | null>(null);

export function ScrollMotionProvider({
  children,
  scrollRange = 700,
}: {
  children: ReactNode;
  scrollRange?: number;
}) {
  const listenersRef = useRef(new Set<(snapshot: ScrollMotionSnapshot) => void>());
  const value = useMemo<ScrollMotionSubscription>(() => ({
    subscribe(listener) {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
  }), []);

  useEffect(() => {
    let frameId = 0;
    const render = (timestamp: number) => {
      frameId = 0;
      const progress = Math.min(Math.max(window.scrollY / Math.max(scrollRange, 1), 0), 1);
      const snapshot = { progress, timestamp };
      listenersRef.current.forEach((listener) => listener(snapshot));
    };
    const update = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', update);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
    };
  }, [scrollRange]);

  return <ScrollMotionContext.Provider value={value}>{children}</ScrollMotionContext.Provider>;
}

export function useScrollMotion() {
  return useContext(ScrollMotionContext);
}
