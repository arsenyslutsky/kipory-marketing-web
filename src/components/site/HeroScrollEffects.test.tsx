import { act, render, waitFor } from '@testing-library/react';
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

  it('waits for every workflow to settle before marking the hero reveal ready', async () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));

    const { container } = render(
      <HeroScrollEffects data-workflows-ready="false">
        <div data-flow-state="loading" />
        <div data-flow-state="loading" />
        <div data-flow-state="loading" />
      </HeroScrollEffects>,
    );
    const main = container.querySelector('main');
    const workflows = Array.from(container.querySelectorAll<HTMLElement>('[data-flow-state]'));

    expect(main).toHaveAttribute('data-workflows-ready', 'false');

    act(() => {
      workflows[0].setAttribute('data-flow-state', 'ready');
      workflows[1].setAttribute('data-flow-state', 'ready');
    });
    await waitFor(() => expect(main).toHaveAttribute('data-workflows-ready', 'false'));

    act(() => workflows[2].setAttribute('data-flow-state', 'error'));
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
