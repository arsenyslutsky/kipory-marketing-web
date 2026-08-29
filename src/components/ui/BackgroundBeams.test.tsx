import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

it('renders a decorative beam field that accepts a positioning class', async () => {
  const modulePath = './BackgroundBeams';
  const beamsModule = await import(/* @vite-ignore */ modulePath).catch(() => undefined);

  expect(beamsModule, 'the reusable background-beams component should exist').toBeDefined();
  if (!beamsModule) return;

  const { BackgroundBeams } = beamsModule;
  const { container } = render(<BackgroundBeams className="hero-position" />);
  const field = container.querySelector('[data-background-beams]');

  expect(field).toHaveClass('hero-position');
  expect(field).toHaveAttribute('aria-hidden', 'true');
  expect(field).toHaveStyle({ pointerEvents: 'none' });
  expect(field?.querySelector('svg')).toBeInTheDocument();
});

it('shares one gradient and one ambient glow across every moving beam', async () => {
  const modulePath = './BackgroundBeams';
  const { BackgroundBeams } = await import(/* @vite-ignore */ modulePath);
  const { container } = render(<BackgroundBeams />);
  const movingPaths = [...container.querySelectorAll('path[class*="beamPath"]')];
  const gradientIds = [...container.querySelectorAll('linearGradient')]
    .map((gradient) => gradient.id);

  expect(movingPaths).toHaveLength(20);
  expect(gradientIds).toHaveLength(1);
  expect(movingPaths.every((path) => path.getAttribute('stroke') === `url(#${gradientIds[0]})`)).toBe(true);
  expect(container.querySelectorAll('[data-beam-ambient-glow]')).toHaveLength(1);
});
