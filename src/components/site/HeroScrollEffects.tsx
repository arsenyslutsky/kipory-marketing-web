'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

type HeroScrollEffectsProps = ComponentPropsWithoutRef<'main'> & {
  scrollRange?: number;
};

export function HeroScrollEffects({ scrollRange = 700, ...props }: HeroScrollEffectsProps) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    let frameId = 0;

    const render = () => {
      frameId = 0;
      const progress = Math.min(Math.max(window.scrollY / Math.max(scrollRange, 1), 0), 1);
      main.style.setProperty('--hero-scroll-progress', String(progress));
    };

    const update = () => {
      if (!frameId) frameId = window.requestAnimationFrame(render);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      main.style.removeProperty('--hero-scroll-progress');
    };
  }, [scrollRange]);

  return <main ref={mainRef} {...props} />;
}
