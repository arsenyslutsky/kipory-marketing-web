import { render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { createNode3DScene } from './createNode3DScene';
import { Node3D } from './Node3D';

vi.mock('./createNode3DScene', () => ({
  createNode3DScene: vi.fn(() => ({ destroy: vi.fn() })),
}));

afterEach(() => {
  vi.mocked(createNode3DScene).mockClear();
});

it('forwards distinct icon fill and stroke colors to the standalone Node3D scene', () => {
  render(<Node3D iconColor="#123456" iconStrokeColor="#fedcba" />);

  expect(createNode3DScene).toHaveBeenCalledWith(expect.objectContaining({
    iconColor: '#123456',
    iconStrokeColor: '#fedcba',
  }));
});

it('forwards the node body color to the standalone Node3D scene', () => {
  render(<Node3D bodyColor="#123456" />);

  expect(createNode3DScene).toHaveBeenCalledWith(expect.objectContaining({
    bodyColor: '#123456',
  }));
});

it('keeps the standalone Node3D stroke color optional for legacy callers', () => {
  render(<Node3D iconColor="#123456" />);

  expect(createNode3DScene).toHaveBeenCalledWith(expect.objectContaining({
    iconColor: '#123456',
    iconStrokeColor: undefined,
  }));
});

it('defaults to dark mode outside a theme provider', () => {
  const view = render(<Node3D />);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createNode3DScene).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'dark' }));
});

it('inherits light mode and light gradient defaults from the theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Node3D /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'light');
  expect(createNode3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    frontGradientEndColor: businessFlowPalettes.light.frontGradient.end,
    frontGradientMidColor: businessFlowPalettes.light.frontGradient.mid,
    frontGradientStartColor: businessFlowPalettes.light.frontGradient.start,
    mode: 'light',
    sideXGradientEndColor: businessFlowPalettes.light.sideXGradient.end,
    sideZGradientEndColor: businessFlowPalettes.light.sideZGradient.end,
  }));
});

it('prefers an explicit dark mode over a light theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Node3D mode="dark" /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createNode3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    frontGradientStartColor: businessFlowPalettes.dark.frontGradient.start,
    mode: 'dark',
  }));
});

it('destroys the previous scene before constructing a replacement for a provider mode change', () => {
  const events: string[] = [];
  vi.mocked(createNode3DScene).mockImplementation((options) => {
    events.push(`create:${options.mode}`);
    return { destroy: vi.fn(() => events.push(`destroy:${options.mode}`)) };
  });
  const view = render(<ThemeProvider preference="light"><Node3D /></ThemeProvider>);

  view.rerender(<ThemeProvider preference="dark"><Node3D /></ThemeProvider>);

  expect(events).toEqual(['create:light', 'destroy:light', 'create:dark']);
});
