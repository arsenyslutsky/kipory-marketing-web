import { render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { Connector3D } from './Connector3D';
import { createConnector3DScene } from './createConnector3DScene';

vi.mock('./createConnector3DScene', () => ({
  createConnector3DScene: vi.fn(() => ({ destroy: vi.fn() })),
}));

afterEach(() => {
  vi.mocked(createConnector3DScene).mockClear();
});

it('defaults to dark mode outside a theme provider', () => {
  const view = render(<Connector3D />);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createConnector3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    color: businessFlowPalettes.dark.connector,
    mode: 'dark',
  }));
});

it('inherits light mode and the light connector default from the theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Connector3D /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'light');
  expect(createConnector3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    color: businessFlowPalettes.light.connector,
    mode: 'light',
  }));
});

it('prefers an explicit dark mode over a light theme provider', () => {
  const view = render(<ThemeProvider preference="light"><Connector3D mode="dark" /></ThemeProvider>);

  expect(view.getByRole('img')).toHaveAttribute('data-mode', 'dark');
  expect(createConnector3DScene).toHaveBeenLastCalledWith(expect.objectContaining({
    color: businessFlowPalettes.dark.connector,
    mode: 'dark',
  }));
});

it('destroys the previous scene before constructing a replacement for a provider mode change', () => {
  const events: string[] = [];
  vi.mocked(createConnector3DScene).mockImplementation((options) => {
    events.push(`create:${options.mode}`);
    return { destroy: vi.fn(() => events.push(`destroy:${options.mode}`)) };
  });
  const view = render(<ThemeProvider preference="light"><Connector3D /></ThemeProvider>);

  view.rerender(<ThemeProvider preference="dark"><Connector3D /></ThemeProvider>);

  expect(events).toEqual(['create:light', 'destroy:light', 'create:dark']);
});
