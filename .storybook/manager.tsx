import React from 'react';
import { STORY_ARGS_UPDATED } from 'storybook/internal/core-events';
import {
  addons,
  types,
  useArgs,
  useArgTypes,
  useParameter,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';

import {
  HomepagePresetToolbar,
  type HomepagePresetArgsSubscriber,
} from './HomepagePresetToolbar.tsx';
import {
  isHomepagePresetStoryId,
  type HomepagePresetParameter,
} from './homepagePresetContract.ts';

const ADDON_ID = 'kipory/homepage-parameters';
const TOOL_ID = `${ADDON_ID}/tool`;

function HomepagePresetTool() {
  const [args, , , initialArgs] = useArgs();
  const argTypes = useArgTypes();
  const homepagePreset = useParameter<HomepagePresetParameter | undefined>(
    'homepagePreset',
    undefined,
  );
  const api = useStorybookApi();
  const { storyId, viewMode } = useStorybookState();
  const subscribeToArgs = React.useCallback<HomepagePresetArgsSubscriber>((listener) => {
    api.on(STORY_ARGS_UPDATED, listener);
    return () => api.off(STORY_ARGS_UPDATED, listener);
  }, [api]);
  const getCurrentArgs = React.useCallback(() => {
    const story = api.getCurrentStoryData();
    return story?.type === 'story' ? story.args : args;
  }, [api, args]);

  if (
    viewMode !== 'story' ||
    !isHomepagePresetStoryId(storyId) ||
    // Storybook briefly clears args and controls when switching stories.
    !args ||
    !argTypes ||
    !Array.isArray(homepagePreset?.keys) ||
    !homepagePreset.keys.every((key) => typeof key === 'string')
  ) {
    return null;
  }

  return (
    <HomepagePresetToolbar
      key={storyId}
      storyId={storyId}
      args={args}
      initialArgs={initialArgs}
      argTypes={argTypes}
      presetKeys={homepagePreset.keys}
      getCurrentArgs={getCurrentArgs}
      subscribeToArgs={subscribeToArgs}
    />
  );
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Save homepage parameters',
    render: HomepagePresetTool,
  });
});
