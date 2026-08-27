import { act, fireEvent, render, screen } from '@testing-library/react';
import { ensure, ThemeProvider, themes } from 'storybook/theming';
import { expect, it, vi } from 'vitest';

import { HomepagePresetToolbar } from './HomepagePresetToolbar';

const storyId = 'animated-illustrations-businessflowhorizontal--current-nextjs-app' as const;
const baseProps = {
  storyId,
  args: {
    connectorOpacity: 0.64,
    beamEnabled: true,
    renderLabel: () => 'ignored',
    hidden: 5,
  },
  argTypes: {
    connectorOpacity: {},
    beamEnabled: {},
    renderLabel: {},
    hidden: { table: { disable: true } },
  },
  presetKeys: ['connectorOpacity', 'beamEnabled', 'renderLabel', 'hidden'],
};

function renderToolbar(fetcher: typeof globalThis.fetch) {
  return render(
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar {...baseProps} fetcher={fetcher} />
    </ThemeProvider>,
  );
}

it('submits filtered current args and shows saving then saved states', async () => {
  let resolveSave: ((response: Response) => void) | undefined;
  const saveResponse = new Promise<Response>((resolve) => {
    resolveSave = resolve;
  });
  const fetcher = vi.fn((_: string, init?: RequestInit) => {
    if (init?.method === 'GET') {
      return Promise.resolve(Response.json({ available: true }));
    }
    return saveResponse;
  });

  renderToolbar(fetcher);

  expect(await screen.findByRole('button', { name: 'Copy illustration parameters as JSON' })).toBeEnabled();
  const saveButton = await screen.findByRole('button', { name: 'Save to Next.js' });
  fireEvent.click(saveButton);
  expect(screen.getByRole('button', { name: 'Saving…' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );

  const [, requestInit] = fetcher.mock.calls[1];
  expect(requestInit?.body).toBe(
    JSON.stringify({
      storyId,
      args: { connectorOpacity: 0.64, beamEnabled: true },
    }),
  );

  await act(async () => {
    resolveSave?.(Response.json({ saved: true }));
    await saveResponse;
  });
  expect(await screen.findByRole('button', { name: 'Saved' })).toBeEnabled();
});

it('keeps copy available and disables saving outside the local development server', async () => {
  const fetcher = vi.fn(async () => new Response(null, { status: 404 }));
  renderToolbar(fetcher);

  expect(
    await screen.findByRole('button', {
      name: 'Save unavailable: use the local Storybook development server',
    }),
  ).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('button', { name: 'Copy illustration parameters as JSON' })).toBeEnabled();
});

it('shows the safe server error after a rejected save', async () => {
  const fetcher = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ available: true }))
    .mockResolvedValueOnce(Response.json({ error: 'Preset rejected' }, { status: 400 }));
  renderToolbar(fetcher);

  fireEvent.click(await screen.findByRole('button', { name: 'Save to Next.js' }));

  expect(
    await screen.findByRole('button', { name: 'Save failed: Preset rejected' }),
  ).toBeEnabled();
});

it('uses args that Storybook mutates in place before saving', async () => {
  const mutableArgs = { connectorOpacity: 0.22 };
  const stableArgTypes = { connectorOpacity: {} };
  const fetcher = vi.fn(async (_input: string, init?: RequestInit) => (
    init?.method === 'GET'
      ? Response.json({ available: true })
      : Response.json({ saved: true })
  ));
  const createToolbar = () => (
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar
        storyId={storyId}
        args={mutableArgs}
        argTypes={stableArgTypes}
        presetKeys={['connectorOpacity']}
        fetcher={fetcher}
      />
    </ThemeProvider>
  );
  const { rerender } = render(createToolbar());
  await screen.findByRole('button', { name: 'Save to Next.js' });

  mutableArgs.connectorOpacity = 0.23;
  rerender(createToolbar());
  fireEvent.click(screen.getByRole('button', { name: 'Save to Next.js' }));
  await screen.findByRole('button', { name: 'Saved' });

  expect(fetcher.mock.calls[1][1]?.body).toBe(
    JSON.stringify({ storyId, args: { connectorOpacity: 0.23 } }),
  );
});

it('saves the latest args announced by the Storybook manager channel', async () => {
  let announceArgs: ((update: { storyId: string; args: Record<string, unknown> }) => void) | undefined;
  const subscribeToArgs = (
    listener: (update: { storyId: string; args: Record<string, unknown> }) => void,
  ) => {
    announceArgs = listener;
    return () => undefined;
  };
  const fetcher = vi.fn(async (_input: string, init?: RequestInit) => (
    init?.method === 'GET'
      ? Response.json({ available: true })
      : Response.json({ saved: true })
  ));
  render(
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar
        storyId={storyId}
        args={{ connectorColor: '#fefefe' }}
        argTypes={{ connectorColor: {} }}
        presetKeys={['connectorColor']}
        fetcher={fetcher}
        subscribeToArgs={subscribeToArgs}
      />
    </ThemeProvider>,
  );
  await screen.findByRole('button', { name: 'Save to Next.js' });

  act(() => {
    announceArgs?.({ storyId, args: { connectorColor: '#ffffff' } });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save to Next.js' }));
  await screen.findByRole('button', { name: 'Saved' });

  expect(fetcher.mock.calls[1][1]?.body).toBe(
    JSON.stringify({ storyId, args: { connectorColor: '#ffffff' } }),
  );
});

it('queries authoritative manager args at the moment save is clicked', async () => {
  let latestArgs = { connectorColor: '#fefefe' };
  const fetcher = vi.fn(async (_input: string, init?: RequestInit) => (
    init?.method === 'GET'
      ? Response.json({ available: true })
      : Response.json({ saved: true })
  ));
  render(
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar
        storyId={storyId}
        args={latestArgs}
        argTypes={{ connectorColor: {} }}
        presetKeys={['connectorColor']}
        fetcher={fetcher}
        getCurrentArgs={() => latestArgs}
      />
    </ThemeProvider>,
  );
  await screen.findByRole('button', { name: 'Save to Next.js' });

  latestArgs = { connectorColor: '#ffffff' };
  fireEvent.click(screen.getByRole('button', { name: 'Save to Next.js' }));
  await screen.findByRole('button', { name: 'Saved' });

  expect(fetcher.mock.calls[1][1]?.body).toBe(
    JSON.stringify({ storyId, args: { connectorColor: '#ffffff' } }),
  );
});

it('prefers a newer manager-channel update over a stale story-data snapshot', async () => {
  let announceArgs: ((update: { storyId: string; args: Record<string, unknown> }) => void) | undefined;
  const subscribeToArgs = (
    listener: (update: { storyId: string; args: Record<string, unknown> }) => void,
  ) => {
    announceArgs = listener;
    return () => undefined;
  };
  const fetcher = vi.fn(async (_input: string, init?: RequestInit) => (
    init?.method === 'GET'
      ? Response.json({ available: true })
      : Response.json({ saved: true })
  ));
  render(
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar
        storyId={storyId}
        args={{ connectorColor: '#fefefe' }}
        argTypes={{ connectorColor: {} }}
        presetKeys={['connectorColor']}
        fetcher={fetcher}
        getCurrentArgs={() => ({ connectorColor: '#fefefe' })}
        subscribeToArgs={subscribeToArgs}
      />
    </ThemeProvider>,
  );
  await screen.findByRole('button', { name: 'Save to Next.js' });

  act(() => {
    announceArgs?.({ storyId, args: { connectorColor: '#ffffff' } });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save to Next.js' }));
  await screen.findByRole('button', { name: 'Saved' });

  expect(fetcher.mock.calls[1][1]?.body).toBe(
    JSON.stringify({ storyId, args: { connectorColor: '#ffffff' } }),
  );
});

it('does not submit component defaults that are outside the registered preset keys', async () => {
  const fetcher = vi.fn(async (_input: string, init?: RequestInit) => (
    init?.method === 'GET'
      ? Response.json({ available: true })
      : Response.json({ saved: true })
  ));
  render(
    <ThemeProvider theme={ensure(themes.light)}>
      <HomepagePresetToolbar
        storyId={storyId}
        args={{ connectorOpacity: 0.62, assetBasePath: '/assets/nodes' }}
        argTypes={{ connectorOpacity: {}, assetBasePath: {} }}
        presetKeys={['connectorOpacity']}
        fetcher={fetcher}
      />
    </ThemeProvider>,
  );

  fireEvent.click(await screen.findByRole('button', { name: 'Save to Next.js' }));
  await screen.findByRole('button', { name: 'Saved' });

  expect(fetcher.mock.calls[1][1]?.body).toBe(
    JSON.stringify({ storyId, args: { connectorOpacity: 0.62 } }),
  );
});
