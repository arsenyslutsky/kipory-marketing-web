'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import {
  ScrollMotionProvider,
  useScrollMotion,
} from '@/components/motion/ScrollMotionContext';

type HeroScrollEffectsProps = ComponentPropsWithoutRef<'main'> & {
  scrollRange?: number;
};

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const easeOutQuadratic = (value: number) => 1 - ((1 - value) ** 2);
const mobileStaticMotionQuery = '(max-width: 620px)';

export function HeroScrollEffects({ scrollRange = 700, ...props }: HeroScrollEffectsProps) {
  return (
    <ScrollMotionProvider scrollRange={scrollRange}>
      <HeroScrollEffectsContent scrollRange={scrollRange} {...props} />
    </ScrollMotionProvider>
  );
}

function HeroScrollEffectsContent({ scrollRange = 700, ...props }: HeroScrollEffectsProps) {
  const mainRef = useRef<HTMLElement>(null);
  const scrollMotion = useScrollMotion();

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const heroWorkflow = main.querySelector<HTMLElement>('[data-hero-workflow] [data-flow-state]');
    const syncWorkflowReadiness = () => {
      const ready = !heroWorkflow || heroWorkflow.dataset.flowState !== 'loading';
      main.dataset.workflowsReady = String(ready);
    };
    const observer = new MutationObserver(syncWorkflowReadiness);

    if (heroWorkflow) observer.observe(heroWorkflow, {
      attributeFilter: ['data-flow-state'],
      attributes: true,
    });
    syncWorkflowReadiness();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    if (window.matchMedia(mobileStaticMotionQuery).matches) {
      main.dataset.contentRevealReady = 'true';
      return;
    }

    const finalHeroStage = main.querySelector<HTMLElement>('[data-hero-reveal="actions"]');
    if (!finalHeroStage) {
      main.dataset.contentRevealReady = 'true';
      return;
    }

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let revealTimer = 0;
    let restoreFrame = 0;
    const unlockContent = (event: AnimationEvent) => {
      if (event.target !== finalHeroStage) return;
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(() => {
        main.dataset.contentRevealReady = 'true';
      }, motionPreference.matches ? 0 : 500);
    };
    const unlockRestoredContent = () => {
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      restoreFrame = window.requestAnimationFrame(() => {
        restoreFrame = 0;
        if (window.scrollY <= 0) return;
        window.clearTimeout(revealTimer);
        main.dataset.contentRevealReady = 'true';
      });
    };

    finalHeroStage.addEventListener('animationend', unlockContent);
    window.addEventListener('pageshow', unlockRestoredContent);
    unlockRestoredContent();

    return () => {
      window.clearTimeout(revealTimer);
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      finalHeroStage.removeEventListener('animationend', unlockContent);
      window.removeEventListener('pageshow', unlockRestoredContent);
    };
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const sections = Array.from(main.querySelectorAll<HTMLElement>('[data-section-reveal]'));
    if (window.matchMedia(mobileStaticMotionQuery).matches || typeof IntersectionObserver === 'undefined') {
      sections.forEach((section) => {
        section.dataset.sectionRevealVisible = 'true';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.sectionRevealVisible = 'true';
        observer.unobserve(entry.target);
      });
    }, { threshold: .15 });

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const textGroups = Array.from(main.querySelectorAll<HTMLElement>('[data-scroll-parallax]'));
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia(mobileStaticMotionQuery);

    main.dataset.scrollMotionReady = motionPreference.matches
      ? 'reduced'
      : mobileViewport.matches ? 'static' : 'true';

    const render = ({ progress }: { progress: number }) => {
      if (mobileViewport.matches) {
        main.style.removeProperty('--hero-scroll-progress');
        textGroups.forEach((group) => {
          group.style.removeProperty('--scroll-text-visibility');
          group.style.removeProperty('--scroll-text-shift');
        });
        return;
      }

      if (motionPreference.matches) {
        main.style.setProperty('--hero-scroll-progress', String(progress));
        textGroups.forEach((group) => {
          group.style.removeProperty('--scroll-text-visibility');
          group.style.removeProperty('--scroll-text-shift');
        });
        return;
      }

      const viewportHeight = window.innerHeight;
      const revealDistance = Math.min(520, Math.max(240, viewportHeight * .4));
      const measurements = textGroups.map((group) => {
        const rect = group.getBoundingClientRect();
        const entry = easeOutQuadratic(clamp((viewportHeight - rect.top) / revealDistance));
        const exit = clamp(rect.bottom / revealDistance);
        const visibility = Math.min(entry, exit);
        const shift = entry < 1 ? 1 - entry : exit < 1 ? -(1 - exit) : 0;
        const scrollAwareShift = shift * progress;

        return { group, scrollAwareShift, visibility };
      });

      main.style.setProperty('--hero-scroll-progress', String(progress));
      measurements.forEach(({ group, scrollAwareShift, visibility }) => {
        if (group.dataset.scrollFade === 'false') {
          group.style.removeProperty('--scroll-text-visibility');
        } else {
          group.style.setProperty('--scroll-text-visibility', String(visibility));
        }
        group.style.setProperty('--scroll-text-shift', String(scrollAwareShift));
      });
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
        behavior: motionPreference.matches || mobileViewport.matches ? 'auto' : 'smooth',
      });
    };

    const unsubscribe = scrollMotion?.subscribe(render);
    main.addEventListener('click', scrollToSection);

    return () => {
      unsubscribe?.();
      main.removeEventListener('click', scrollToSection);
      main.style.removeProperty('--hero-scroll-progress');
      delete main.dataset.scrollMotionReady;
      textGroups.forEach((group) => {
        group.style.removeProperty('--scroll-text-visibility');
        group.style.removeProperty('--scroll-text-shift');
      });
    };
  }, [scrollMotion, scrollRange]);

  return <main ref={mainRef} {...props} />;
}
