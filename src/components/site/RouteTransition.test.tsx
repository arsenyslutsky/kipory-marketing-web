import type { PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const viewTransitionRender = vi.hoisted(() => vi.fn());

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');

  return {
    ...actual,
    ViewTransition: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => {
      viewTransitionRender(props);
      return children;
    },
  };
});

it('marks page content and configures the quiet route handoff', async () => {
  const routeTransitionPath = './RouteTransition';
  const routeTransitionModule = await import(/* @vite-ignore */ routeTransitionPath).catch(() => null);

  expect(routeTransitionModule).not.toBeNull();
  if (!routeTransitionModule) return;

  const { RouteTransition } = routeTransitionModule;
  render(
    <RouteTransition>
      <main>Route content</main>
    </RouteTransition>,
  );

  expect(screen.getByRole('main')).toHaveAttribute('data-route-transition', 'quiet-signal');
  expect(viewTransitionRender).toHaveBeenCalledWith({
    default: 'none',
    enter: 'route-enter',
    exit: 'route-exit',
  });
});
