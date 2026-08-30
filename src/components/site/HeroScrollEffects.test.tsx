import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroScrollEffects } from './HeroScrollEffects';

type RectState = Pick<DOMRect, 'top' | 'bottom' | 'height'>;

describe('HeroScrollEffects', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('maps marked text groups through the viewport reading zone', () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    let rect: RectState = { top: 890, bottom: 990, height: 100 };

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });

    const { container } = render(
      <HeroScrollEffects>
        <p data-scroll-parallax>Text moving through the reading zone</p>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const text = container.querySelector<HTMLElement>('[data-scroll-parallax]');
    expect(main).not.toBeNull();
    expect(text).not.toBeNull();
    vi.spyOn(text!, 'getBoundingClientRect').mockImplementation(() => rect as DOMRect);

    act(() => scheduledFrame?.(0));

    expect(main).toHaveAttribute('data-scroll-motion-ready', 'true');
    expect(text?.style.getPropertyValue('--scroll-text-visibility')).toBe('0.474375');
    expect(text?.style.getPropertyValue('--scroll-text-shift')).toBe('0.525625');

    rect = { top: 450, bottom: 550, height: 100 };
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      scheduledFrame?.(16);
    });

    expect(text?.style.getPropertyValue('--scroll-text-visibility')).toBe('1');
    expect(text?.style.getPropertyValue('--scroll-text-shift')).toBe('0');

    rect = { top: -100, bottom: 0, height: 100 };
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      scheduledFrame?.(32);
    });

    expect(text?.style.getPropertyValue('--scroll-text-visibility')).toBe('0');
    expect(text?.style.getPropertyValue('--scroll-text-shift')).toBe('-1');
  });

  it('keeps every marked text group stationary before the page scrolls', () => {
    let scheduledFrame: FrameRequestCallback | undefined;

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });

    const { container } = render(
      <HeroScrollEffects>
        <h1 data-scroll-parallax data-scroll-fade="false">Hero heading</h1>
        <p data-scroll-parallax>Below-fold capability row</p>
      </HeroScrollEffects>,
    );
    const [heading, capabilityRow] = Array.from(
      container.querySelectorAll<HTMLElement>('[data-scroll-parallax]'),
    );
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 200,
      height: 100,
    } as DOMRect);
    vi.spyOn(capabilityRow, 'getBoundingClientRect').mockReturnValue({
      top: 800,
      bottom: 900,
      height: 100,
    } as DOMRect);

    act(() => scheduledFrame?.(0));

    expect(heading.style.getPropertyValue('--scroll-text-shift')).toBe('0');
    expect(capabilityRow.style.getPropertyValue('--scroll-text-shift')).toBe('0');
  });

  it('keeps opted-out text fully opaque while preserving its spatial parallax', () => {
    let scheduledFrame: FrameRequestCallback | undefined;

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 700 });
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });

    const { container } = render(
      <HeroScrollEffects>
        <h1 data-scroll-parallax data-scroll-fade="false">Always full color</h1>
        <p data-scroll-parallax>Text that still fades</p>
      </HeroScrollEffects>,
    );
    const [heading, paragraph] = Array.from(
      container.querySelectorAll<HTMLElement>('[data-scroll-parallax]'),
    );
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      top: 890,
      bottom: 990,
      height: 100,
    } as DOMRect);
    vi.spyOn(paragraph, 'getBoundingClientRect').mockReturnValue({
      top: 890,
      bottom: 990,
      height: 100,
    } as DOMRect);

    act(() => scheduledFrame?.(0));

    expect(heading.style.getPropertyValue('--scroll-text-visibility')).toBe('');
    expect(heading.style.getPropertyValue('--scroll-text-shift')).toBe('0.525625');
    expect(paragraph.style.getPropertyValue('--scroll-text-visibility')).toBe('0.474375');
  });

  it('reconciles visible text when the browser restores scroll without a scroll event', () => {
    const scheduledFrames: FrameRequestCallback[] = [];
    let rect: RectState = { top: 1200, bottom: 1300, height: 100 };

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrames.push(callback);
      return scheduledFrames.length;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });

    const { container } = render(
      <HeroScrollEffects data-content-reveal-ready="false">
        <span data-hero-reveal="actions">Hero actions</span>
        <section data-section-reveal>
          <p data-scroll-parallax>Restored viewport text</p>
        </section>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const text = container.querySelector<HTMLElement>('[data-scroll-parallax]')!;
    vi.spyOn(text, 'getBoundingClientRect').mockImplementation(() => rect as DOMRect);

    act(() => {
      scheduledFrames.splice(0).forEach((frame) => frame(0));
    });
    expect(text.style.getPropertyValue('--scroll-text-visibility')).toBe('0');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 900 });
    rect = { top: 450, bottom: 550, height: 100 };
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
      scheduledFrames.splice(0).forEach((frame) => frame(16));
    });

    expect(main).toHaveAttribute('data-content-reveal-ready', 'true');
    expect(text.style.getPropertyValue('--scroll-text-visibility')).toBe('1');
  });

  it('keeps marked text static when reduced motion is requested', () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    const motionPreference = {
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } satisfies MediaQueryList;

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => motionPreference));

    const { container } = render(
      <HeroScrollEffects>
        <p data-scroll-parallax>Static accessible text</p>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const text = container.querySelector<HTMLElement>('[data-scroll-parallax]');
    vi.spyOn(text!, 'getBoundingClientRect').mockReturnValue({
      top: 890,
      bottom: 990,
      height: 100,
    } as DOMRect);

    act(() => scheduledFrame?.(0));

    expect(main).toHaveAttribute('data-scroll-motion-ready', 'reduced');
    expect(text?.style.getPropertyValue('--scroll-text-visibility')).toBe('');
    expect(text?.style.getPropertyValue('--scroll-text-shift')).toBe('');
  });

  it('shows mobile text immediately without scroll-driven reveal state', () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    const observe = vi.fn();

    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(max-width: 620px)',
    }) as MediaQueryList));
    vi.stubGlobal('IntersectionObserver', class {
      observe = observe;
      unobserve() {}
      disconnect() {}
    });

    const { container } = render(
      <HeroScrollEffects data-content-reveal-ready="false">
        <span data-hero-reveal="actions">Hero actions</span>
        <section data-section-reveal>
          <p data-scroll-parallax>Immediately visible mobile text</p>
        </section>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const section = container.querySelector('[data-section-reveal]');
    const text = container.querySelector<HTMLElement>('[data-scroll-parallax]');

    act(() => scheduledFrame?.(0));

    expect(main).toHaveAttribute('data-scroll-motion-ready', 'static');
    expect(main).toHaveAttribute('data-content-reveal-ready', 'true');
    expect(section).toHaveAttribute('data-section-reveal-visible', 'true');
    expect(observe).not.toHaveBeenCalled();
    expect(main?.style.getPropertyValue('--hero-scroll-progress')).toBe('');
    expect(text?.style.getPropertyValue('--scroll-text-visibility')).toBe('');
    expect(text?.style.getPropertyValue('--scroll-text-shift')).toBe('');
  });

  it('uses instant in-page navigation on mobile', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(max-width: 620px)',
    }) as MediaQueryList));
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => ({
      transform: 'none',
      fontSize: element === document.documentElement ? '16px' : '',
    }) as CSSStyleDeclaration);

    const { container } = render(
      <HeroScrollEffects>
        <a href="#pillars" data-scroll-shift-rem="0">Explore our pillars</a>
        <section id="pillars">Pillars</section>
      </HeroScrollEffects>,
    );
    const target = container.querySelector<HTMLElement>('#pillars')!;
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      top: 780,
      bottom: 980,
      height: 200,
    } as DOMRect);

    fireEvent.click(container.querySelector('a')!);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 780,
      behavior: 'auto',
    });
  });

  it('waits only for the hero workflow before marking the hero reveal ready', async () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));

    const { container } = render(
      <HeroScrollEffects data-workflows-ready="false">
        <div data-hero-workflow><div data-flow-state="loading" /></div>
        <div data-flow-state="loading" data-lower-workflow />
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const heroWorkflow = container.querySelector<HTMLElement>('[data-hero-workflow] [data-flow-state]')!;

    expect(main).toHaveAttribute('data-workflows-ready', 'false');

    act(() => {
      heroWorkflow.setAttribute('data-flow-state', 'ready');
    });
    await waitFor(() => expect(main).toHaveAttribute('data-workflows-ready', 'true'));
  });

  it('marks a workflow section visible only after its first viewport appearance', () => {
    let revealSection: (isIntersecting: boolean) => void = () => undefined;

    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        revealSection = (isIntersecting) => callback([
          { isIntersecting, target: document.querySelector('[data-section-reveal]')! } as IntersectionObserverEntry,
        ], this as unknown as IntersectionObserver);
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    });

    const { container } = render(
      <HeroScrollEffects>
        <section data-section-reveal>Workflow section</section>
      </HeroScrollEffects>,
    );
    const section = container.querySelector('[data-section-reveal]');

    expect(section).not.toHaveAttribute('data-section-reveal-visible');

    act(() => revealSection(false));
    expect(section).not.toHaveAttribute('data-section-reveal-visible');

    act(() => revealSection(true));
    expect(section).toHaveAttribute('data-section-reveal-visible', 'true');
  });

  it('unlocks the content cascade 500ms after the final hero stage finishes', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));

    const { container } = render(
      <HeroScrollEffects data-content-reveal-ready="false">
        <span data-hero-reveal="actions">Hero actions</span>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const finalHeroStage = container.querySelector('[data-hero-reveal="actions"]')!;

    act(() => finalHeroStage.dispatchEvent(new Event('animationend')));
    act(() => vi.advanceTimersByTime(499));
    expect(main).toHaveAttribute('data-content-reveal-ready', 'false');

    act(() => vi.advanceTimersByTime(1));
    expect(main).toHaveAttribute('data-content-reveal-ready', 'true');
  });

  it('removes the extra cascade wait when reduced motion is requested', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true }) as MediaQueryList));

    const { container } = render(
      <HeroScrollEffects data-content-reveal-ready="false">
        <span data-hero-reveal="actions">Hero actions</span>
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const finalHeroStage = container.querySelector('[data-hero-reveal="actions"]')!;

    act(() => finalHeroStage.dispatchEvent(new Event('animationend')));
    act(() => vi.runAllTimers());

    expect(main).toHaveAttribute('data-content-reveal-ready', 'true');
  });
});
