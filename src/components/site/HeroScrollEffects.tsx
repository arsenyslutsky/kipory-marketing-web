'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

type HeroScrollEffectsProps = ComponentPropsWithoutRef<'main'> & {
  scrollRange?: number;
};

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const easeOutQuadratic = (value: number) => 1 - ((1 - value) ** 2);

export function HeroScrollEffects({ scrollRange = 700, ...props }: HeroScrollEffectsProps) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    let frameId = 0;
    const textGroups = Array.from(main.querySelectorAll<HTMLElement>('[data-scroll-parallax]'));
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    main.dataset.scrollMotionReady = motionPreference.matches ? 'reduced' : 'true';

    const render = () => {
      frameId = 0;
      const progress = clamp(window.scrollY / Math.max(scrollRange, 1));
      main.style.setProperty('--hero-scroll-progress', String(progress));

      if (motionPreference.matches) {
        textGroups.forEach((group) => {
          group.style.removeProperty('--scroll-text-visibility');
          group.style.removeProperty('--scroll-text-shift');
        });
        return;
      }

      const viewportHeight = window.innerHeight;
      const revealDistance = Math.min(520, Math.max(240, viewportHeight * .4));

      textGroups.forEach((group) => {
        const rect = group.getBoundingClientRect();
        const entry = easeOutQuadratic(clamp((viewportHeight - rect.top) / revealDistance));
        const exit = clamp(rect.bottom / revealDistance);
        const visibility = Math.min(entry, exit);
        const shift = entry < 1 ? 1 - entry : exit < 1 ? -(1 - exit) : 0;

        if (group.dataset.scrollFade === 'false') {
          group.style.removeProperty('--scroll-text-visibility');
        } else {
          group.style.setProperty('--scroll-text-visibility', String(visibility));
        }
        group.style.setProperty('--scroll-text-shift', String(shift));
      });
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
        behavior: motionPreference.matches ? 'auto' : 'smooth',
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
      delete main.dataset.scrollMotionReady;
      textGroups.forEach((group) => {
        group.style.removeProperty('--scroll-text-visibility');
        group.style.removeProperty('--scroll-text-shift');
      });
    };
  }, [scrollRange]);

  return <main ref={mainRef} {...props} />;
}
