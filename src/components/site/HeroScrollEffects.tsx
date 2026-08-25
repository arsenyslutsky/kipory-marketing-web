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

    const scrollToSection = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest<HTMLAnchorElement>('a[data-scroll-shift-rem]');
      if (!link || !main.contains(link)) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();

      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0;
      const transform = window.getComputedStyle(target).transform;
      const currentShift = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
      const targetDocumentTop = target.getBoundingClientRect().top + window.scrollY - currentShift;
      const rootSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
      const maxShift = Number(link.dataset.scrollShiftRem) * rootSize;
      let destination = targetDocumentTop - headerHeight;

      for (let index = 0; index < 5; index += 1) {
        const destinationProgress = Math.min(Math.max(destination / Math.max(scrollRange, 1), 0), 1);
        destination = targetDocumentTop - headerHeight - maxShift * destinationProgress;
      }

      window.history.pushState(null, '', url.hash);
      window.scrollTo({
        top: destination,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    main.addEventListener('click', scrollToSection);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      main.removeEventListener('click', scrollToSection);
      main.style.removeProperty('--hero-scroll-progress');
    };
  }, [scrollRange]);

  return <main ref={mainRef} {...props} />;
}
