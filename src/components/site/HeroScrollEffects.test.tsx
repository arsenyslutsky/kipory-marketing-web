import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroScrollEffects } from './HeroScrollEffects';

type RectState = Pick<DOMRect, 'top' | 'bottom' | 'height'>;

describe('HeroScrollEffects', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('maps marked text groups through the viewport reading zone', () => {
    let scheduledFrame: FrameRequestCallback | undefined;
    let rect: RectState = { top: 890, bottom: 990, height: 100 };

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

  it('keeps opted-out text fully opaque while preserving its spatial parallax', () => {
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
});
