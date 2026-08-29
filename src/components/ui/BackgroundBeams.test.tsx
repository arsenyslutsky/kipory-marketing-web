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
