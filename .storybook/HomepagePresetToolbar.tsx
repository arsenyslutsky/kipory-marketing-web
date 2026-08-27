import { CopyIcon, SaveIcon } from '@storybook/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, useCopyButton } from 'storybook/internal/components';

import {
  createHomepagePresetCapabilityRequest,
  createHomepagePresetSaveRequest,
  filterHomepagePresetArgs,
  type HomepagePresetArgs,
  type HomepagePresetArgTypes,
  type HomepagePresetStoryId,
} from './homepagePresetContract.ts';

export type HomepagePresetFetcher = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

type HomepagePresetToolbarProps = {
  storyId: HomepagePresetStoryId;
  args: HomepagePresetArgs;
  argTypes: HomepagePresetArgTypes;
  fetcher?: HomepagePresetFetcher;
};

type SaveStatus = 'checking' | 'ready' | 'saving' | 'saved' | 'failed' | 'unavailable';

async function readServerError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === 'string' ? body.error : 'The preset was not saved.';
  } catch {
    return 'The preset was not saved.';
  }
}

export function HomepagePresetToolbar({
  storyId,
  args,
  argTypes,
  fetcher = globalThis.fetch,
}: HomepagePresetToolbarProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('checking');
  const [saveError, setSaveError] = useState('');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const parameterValues = useMemo(
    () => filterHomepagePresetArgs(args, argTypes),
    [args, argTypes],
  );
  const copy = useCopyButton({
    content: JSON.stringify(parameterValues, null, 2),
    children: 'Copy JSON',
    childrenOnCopy: 'Copied',
    ariaLabel: 'Copy illustration parameters as JSON',
    ariaLabelOnCopy: 'Illustration parameter JSON copied to clipboard',
  });

  useEffect(() => {
    const controller = new AbortController();
    const request = createHomepagePresetCapabilityRequest();

    void fetcher(request.url, { ...request.init, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setSaveStatus('unavailable');
          return;
        }
        const body = (await response.json()) as { available?: unknown };
        if (body.available === true) {
          setSaveStatus('ready');
        } else {
          setSaveStatus('unavailable');
        }
      })
      .catch((error: unknown) => {
        if (!(typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')) {
          setSaveStatus('unavailable');
        }
      });

    return () => controller.abort();
  }, [fetcher, storyId]);

  useEffect(() => () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
  }, []);

  async function save(): Promise<void> {
    if (saveStatus === 'checking' || saveStatus === 'saving' || saveStatus === 'unavailable') {
      return;
    }

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    setSaveStatus('saving');
    setSaveError('');
    const request = createHomepagePresetSaveRequest(storyId, parameterValues);

    try {
      const response = await fetcher(request.url, request.init);
      if (!response.ok) {
        throw new Error(await readServerError(response));
      }
      setSaveStatus('saved');
      resetTimer.current = setTimeout(() => setSaveStatus('ready'), 2_000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The preset was not saved.');
      setSaveStatus('failed');
    }
  }

  const savePresentation = {
    checking: {
      label: 'Checking…',
      ariaLabel: 'Checking save availability',
      tooltip: 'Checking local Storybook save availability',
      disabled: true,
    },
    ready: {
      label: 'Save to Next.js',
      ariaLabel: 'Save to Next.js',
      tooltip: 'Save these parameters to the Next.js homepage preset',
      disabled: false,
    },
    saving: {
      label: 'Saving…',
      ariaLabel: 'Saving…',
      tooltip: 'Saving parameters to the Next.js homepage preset',
      disabled: true,
    },
    saved: {
      label: 'Saved',
      ariaLabel: 'Saved',
      tooltip: 'Parameters saved to the Next.js homepage preset',
      disabled: false,
    },
    failed: {
      label: 'Save failed',
      ariaLabel: `Save failed: ${saveError}`,
      tooltip: saveError,
      disabled: false,
    },
    unavailable: {
      label: 'Save unavailable',
      ariaLabel: 'Save unavailable: use the local Storybook development server',
      tooltip: 'Saving is available only from the local Storybook development server',
      disabled: true,
    },
  }[saveStatus];

  return (
    <>
      <Button
        {...copy.buttonProps}
        padding="small"
        variant="ghost"
        tooltip="Copy all current illustration parameter values as JSON"
      >
        <CopyIcon />
        {copy.children}
      </Button>
      <Button
        ariaLabel={savePresentation.ariaLabel}
        disabled={savePresentation.disabled}
        onClick={() => void save()}
        padding="small"
        tooltip={savePresentation.tooltip}
        variant="ghost"
      >
        <SaveIcon />
        {savePresentation.label}
      </Button>
    </>
  );
}
