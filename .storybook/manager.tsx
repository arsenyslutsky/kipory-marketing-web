import { CopyIcon } from '@storybook/icons';
import React from 'react';
import { Button, useCopyButton } from 'storybook/internal/components';
import { addons, types, useArgs, useArgTypes, useStorybookState } from 'storybook/manager-api';

const ADDON_ID = 'kipory/copy-signal-flow-parameters';
const TOOL_ID = `${ADDON_ID}/tool`;
const SIGNAL_FLOW_STORY_PREFIX = 'animated-illustrations-signal-flow--';

function CopyParametersButton() {
  const [args] = useArgs();
  const argTypes = useArgTypes();
  const parameterValues = Object.fromEntries(
    Object.keys(argTypes)
      .filter((name) => argTypes[name]?.table?.disable !== true && name in args)
      .map((name) => [name, args[name]]),
  );
  const content = JSON.stringify(
    parameterValues,
    (_key, value) => typeof value === 'function' ? undefined : value,
    2,
  );
  const copy = useCopyButton({
    content,
    children: 'Copy JSON',
    childrenOnCopy: 'Copied',
    ariaLabel: 'Copy all Signal Flow parameter values as JSON',
    ariaLabelOnCopy: 'Signal Flow parameter JSON copied to clipboard',
  });

  return (
    <Button
      {...copy.buttonProps}
      padding="small"
      variant="ghost"
      tooltip="Copy all parameter values as JSON"
    >
      <CopyIcon />
      {copy.children}
    </Button>
  );
}

function CopyParametersTool() {
  const { storyId, viewMode } = useStorybookState();
  const isSignalFlowStory = (
    viewMode === 'story' && storyId?.startsWith(SIGNAL_FLOW_STORY_PREFIX) === true
  );

  return isSignalFlowStory ? <CopyParametersButton /> : null;
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Copy Signal Flow parameters',
    render: CopyParametersTool,
  });
});
