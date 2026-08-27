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
