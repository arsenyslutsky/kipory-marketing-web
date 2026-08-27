import { readFileSync } from 'node:fs';
import type { PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import HomePage from './page';

const {
  horizontalHomepageProps,
  horizontalRender,
  threeDHomepageProps,
  threeDRender,
  verticalHomepageProps,
  verticalRender,
} = vi.hoisted(() => ({
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
  GlowLink: ({ children, href }: PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
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
});
