import { readFileSync } from 'node:fs';
import type { PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { glowLinkHomepageProps } from '@/components/ui/GlowLink.presets';
import HomePage from './page';

const {
  glowLinkRender,
  horizontalHomepageProps,
  horizontalRender,
  threeDHomepageProps,
  threeDRender,
  verticalHomepageProps,
  verticalRender,
} = vi.hoisted(() => ({
  glowLinkRender: vi.fn(),
  horizontalHomepageProps: {
    beamSpeed: 1.4,
    height: '38rem',
    width: '20rem',
  },
  horizontalRender: vi.fn(),
  threeDHomepageProps: { cameraZoom: 0.91, mode: 'dark' },
  threeDRender: vi.fn(),
  verticalHomepageProps: { height: '45rem', width: '20rem' },
  verticalRender: vi.fn(),
}));

vi.mock('@/components/site/HeroScrollEffects', () => ({
  HeroScrollEffects: ({ children, className, id }: PropsWithChildren<{ className?: string; id?: string }>) => (
    <main className={className} id={id}>{children}</main>
  ),
}));
vi.mock('@/components/site/BackToTop', () => ({ BackToTop: () => null }));
vi.mock('@/components/ui/GlowLink', () => ({
  GlowLink: ({ children, href, ...props }: PropsWithChildren<{ href: string }>) => {
    glowLinkRender(props);
    return <a href={href}>{children}</a>;
  },
}));
vi.mock('@/features/business-flow-3d', () => ({
  BusinessFlow3D: (props: Record<string, unknown>) => {
    threeDRender(props);
    return <div />;
  },
  businessFlow3DHomepageProps: threeDHomepageProps,
}));
vi.mock('@/features/business-flow-vertical', () => ({
  BusinessFlowVertical: (props: Record<string, unknown>) => {
    verticalRender(props);
    return <div />;
  },
  businessFlowVerticalHomepageProps: verticalHomepageProps,
}));
vi.mock('@/features/business-flow-horizontal', () => ({
  BusinessFlowHorizontal: (props: Record<string, unknown>) => {
    horizontalRender(props);
    return <figure aria-label="Horizontal business flow" />;
  },
  businessFlowHorizontalHomepageProps: horizontalHomepageProps,
}));

beforeEach(() => {
  glowLinkRender.mockClear();
  horizontalRender.mockClear();
  threeDRender.mockClear();
  verticalRender.mockClear();
});

it('renders all shared homepage presets and replaces the delivery placeholder', () => {
  render(<HomePage />);

  const pageSourcePath = './page.tsx';
  const pageSource = readFileSync(new URL(pageSourcePath, import.meta.url), 'utf8');
  expect(pageSource).not.toMatch(/^['"]use client['"];?/);
  expect(screen.queryByText(/illustration placeholder/i)).not.toBeInTheDocument();
  expect(screen.getByRole('figure', { name: 'Horizontal business flow' })).toBeInTheDocument();
  expect(threeDRender.mock.calls[0][0]).toEqual(expect.objectContaining(threeDHomepageProps));
  expect(verticalRender.mock.calls[0][0]).toEqual(expect.objectContaining(verticalHomepageProps));
  expect(horizontalRender).toHaveBeenCalledWith(expect.objectContaining(horizontalHomepageProps));
  expect(glowLinkRender).toHaveBeenCalledWith(expect.objectContaining(glowLinkHomepageProps));
});

it('routes homepage conversion links to the waiting list instead of retired pages', () => {
  render(<HomePage />);

  const destinationPaths = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
  expect(screen.getByRole('link', { name: 'Let’s talk' })).toHaveAttribute('href', '#pillars');
  expect(destinationPaths).toContain('/waitlist');
  expect(destinationPaths).not.toContain('/product');
  expect(destinationPaths).not.toContain('/about');
});

it('uses the accelerated-fit delivery label', () => {
  render(<HomePage />);

  expect(screen.getByText('Designed to fit and accelerate')).toBeInTheDocument();
  expect(screen.queryByText('Designed around real flow')).not.toBeInTheDocument();
});

it('renders every delivery detail as supporting body copy', () => {
  const { container } = render(<HomePage />);

  expect(container.querySelectorAll('#delivery article p')).toHaveLength(4);
});
