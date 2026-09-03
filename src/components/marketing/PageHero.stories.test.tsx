import type { ComponentPropsWithoutRef, PropsWithChildren, ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import * as pageHeroStories from './PageHero.stories';

vi.mock('@/features/business-flow-3d', () => ({
  BusinessFlow3D: () => <figure aria-label="Business workflow" />,
  businessFlow3DHomepageDarkProps: {},
  businessFlow3DHomepageLightProps: {},
}));
vi.mock('@/components/site/HeroScrollEffects', () => ({
  HeroScrollEffects: ({ children, scrollRange, ...props }: PropsWithChildren<ComponentPropsWithoutRef<'main'> & { scrollRange?: number }>) => {
    void scrollRange;
    return <main {...props}>{children}</main>;
  },
}));

it('separates the current Next.js pages fixture from the homepage hero', () => {
  expect(pageHeroStories.CurrentNextjsApp.name).toBe('Current Nextjs Pages');
});

it('renders the production homepage hero as its own story', () => {
  const heroStory = (pageHeroStories as Record<string, {
    args?: Record<string, unknown>;
    name?: string;
    render?: (...args: unknown[]) => ReactElement;
  }>).Hero;

  expect(heroStory?.name).toBe('Hero');
  expect(heroStory?.render).toBeTypeOf('function');

  const { container } = render(heroStory.render?.(heroStory.args ?? {}, {}) as ReactElement);

  expect(screen.getByRole('heading', { level: 1, name: /complex business processes/i })).toBeInTheDocument();
  expect(container.querySelector('[data-hero-workflow] figure')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Let’s talk' })).toHaveAttribute('href', '/contact');
});
