import { CopyIcon } from '@storybook/icons';
import React from 'react';
import { Button, useCopyButton } from 'storybook/internal/components';
import { addons, types, useArgs, useArgTypes, useStorybookState } from 'storybook/manager-api';

const ADDON_ID = 'kipory/copy-business-flow-3d-parameters';
const TOOL_ID = `${ADDON_ID}/tool`;
const BUSINESS_FLOW_3D_STORY_PREFIX = 'animated-illustrations-businessflow3d--';

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
    ariaLabel: 'Copy all BusinessFlow3D parameter values as JSON',
    ariaLabelOnCopy: 'BusinessFlow3D parameter JSON copied to clipboard',
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
  const isBusinessFlow3DStory = (
    viewMode === 'story' && storyId?.startsWith(BUSINESS_FLOW_3D_STORY_PREFIX) === true
  );

  return isBusinessFlow3DStory ? <CopyParametersButton /> : null;
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Copy BusinessFlow3D parameters',
    render: CopyParametersTool,
  });
});
