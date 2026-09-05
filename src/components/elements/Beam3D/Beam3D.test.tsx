import { render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { Beam3D } from './Beam3D';
import { createBeam3DScene } from './createBeam3DScene';

vi.mock('./createBeam3DScene', () => ({
  createBeam3DScene: vi.fn(() => ({ destroy: vi.fn() })),
}));

afterEach(() => {
  vi.mocked(createBeam3DScene).mockClear();
});

it('defaults to dark mode outside a theme provider', () => {
  const view = render(<Beam3D />);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createBeam3DScene).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'dark' }));
});

it('inherits light mode and light beam defaults from the theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Beam3D /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'light');
  expect(createBeam3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    beamColor: businessFlowPalettes.light.beam,
    flareColor: businessFlowPalettes.light.flare,
    highlightColor: businessFlowPalettes.light.beamHighlight,
    mode: 'light',
    packetColor: businessFlowPalettes.light.packetCore,
    packetHaloColor: businessFlowPalettes.light.packetHalo,
  }));
});

it('prefers an explicit dark mode over a light theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Beam3D mode="dark" /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createBeam3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    beamColor: businessFlowPalettes.dark.beam,
    mode: 'dark',
  }));
});

it('destroys the previous scene before constructing a replacement for a provider mode change', () => {
  const events: string[] = [];
  vi.mocked(createBeam3DScene).mockImplementation((options) => {
    events.push(`create:${options.mode}`);
    return { destroy: vi.fn(() => events.push(`destroy:${options.mode}`)) };
  });
  const view = render(<ThemeProvider preference="light"><Beam3D /></ThemeProvider>);

  view.rerender(<ThemeProvider preference="dark"><Beam3D /></ThemeProvider>);

  expect(events).toEqual(['create:light', 'destroy:light', 'create:dark']);
});
