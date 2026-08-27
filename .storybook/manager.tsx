import { addons, types, useArgs, useArgTypes, useStorybookState } from 'storybook/manager-api';

import { HomepagePresetToolbar } from './HomepagePresetToolbar.tsx';
import { isHomepagePresetStoryId } from './homepagePresetContract.ts';

const ADDON_ID = 'kipory/homepage-illustration-parameters';
const TOOL_ID = `${ADDON_ID}/tool`;

function HomepagePresetTool() {
  const [args] = useArgs();
  const argTypes = useArgTypes();
  const { storyId, viewMode } = useStorybookState();

  if (viewMode !== 'story' || !isHomepagePresetStoryId(storyId)) {
    return null;
  }

  return (
    <HomepagePresetToolbar
      key={storyId}
      storyId={storyId}
      args={args}
      argTypes={argTypes}
    />
  );
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Save homepage illustration parameters',
    render: HomepagePresetTool,
  });
});
