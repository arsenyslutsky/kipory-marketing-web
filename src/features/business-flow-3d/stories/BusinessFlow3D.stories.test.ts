import { createElement, isValidElement, type CSSProperties, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from '../presets';
import { homepageFlow } from '../homepageFlow';
import meta, * as stories from './BusinessFlow3D.stories';

describe('BusinessFlow3D current-app stories', () => {
  it('offers explicit dark and light variants with the shared homepage flow', () => {
    expect(stories.CurrentNextjsApp.name).toBe('Current App (Dark)');
    expect(stories.CurrentNextjsApp.args).toEqual({
      ...businessFlow3DHomepageDarkProps,
      flow: homepageFlow,
      mode: 'dark',
    });
    expect(stories.CurrentAppLight.name).toBe('Current App (Light)');
    expect(stories.CurrentAppLight.args).toEqual({
      ...businessFlow3DHomepageLightProps,
      flow: homepageFlow,
      mode: 'light',
    });
    expect(stories.CurrentNextjsApp.args?.flow).toBe(stories.CurrentAppLight.args?.flow);
  });

  it('keeps homepage-preset metadata on both variants', () => {
    expect(stories.CurrentNextjsApp.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlow3DHomepageDarkProps) },
    });
    expect(stories.CurrentAppLight.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlow3DHomepageLightProps) },
    });
  });

  it('keeps progress opacity explicit in both app presets', () => {
    expect(stories.CurrentNextjsApp.args).toMatchObject({ progressBarOpacity: 1 });
    expect(stories.CurrentAppLight.args).toMatchObject({ progressBarOpacity: 1 });
  });

  it('keeps spatial placement identical across the current-app themes', () => {
    const spatialKeys = [
      'cameraPitch',
      'cameraYaw',
      'cameraZoom',
      'cameraTargetOffsetY',
      'emitterX',
      'emitterY',
      'perspectiveEffect',
      'nodeScale',
    ] as const;

    spatialKeys.forEach((key) => {
      expect(stories.CurrentAppLight.args?.[key]).toBe(stories.CurrentNextjsApp.args?.[key]);
    });
  });

  it('crops the light app preview at 500px without resizing the flow scene', () => {
    const decorators = stories.CurrentAppLight.decorators;
    expect(Array.isArray(decorators)).toBe(true);
    if (!Array.isArray(decorators)) throw new Error('Expected story-local decorators.');
    const decorator = decorators[0];
    expect(decorator).toBeTypeOf('function');

    const frame = decorator?.(() => createElement('div'), {} as never);
    expect(isValidElement(frame)).toBe(true);
    const props = (frame as ReactElement<{ style: CSSProperties }>).props;
    expect(props.style).toEqual({ height: 500, overflow: 'hidden' });
  });
});

it('exposes the active progress fill as a color control', () => {
  expect(meta.argTypes.progressBarColor).toMatchObject({
    control: 'color',
    description: 'Color of the active progress fill. The inactive track remains theme-derived.',
    name: 'Progress color',
    table: { category: 'Progress' },
  });
});

it('exposes the active progress fill opacity as a range control', () => {
  expect(meta.argTypes.progressBarOpacity).toMatchObject({
    control: { max: 1, min: 0, step: 0.05, type: 'range' },
    description: 'Opacity of the active progress fill. The inactive track remains theme-derived.',
    name: 'Progress opacity',
    table: { category: 'Progress' },
  });
});

it('exposes independent node and connector elevation controls', () => {
  expect(meta.argTypes.nodeElevation).toMatchObject({
    control: { max: 4, min: -4, step: 0.05, type: 'range' },
    description: 'Additive world-space elevation applied to every node and its animated base position.',
    name: 'Node elevation',
    table: { category: 'Nodes' },
  });
  expect(meta.argTypes.connectorElevation).toMatchObject({
    control: { max: 4, min: -0.1, step: 0.05, type: 'range' },
    description: 'Requested world-space elevation shared by connectors, junctions, and travelling beams, capped below node bodies.',
    name: 'Connector elevation',
    table: { category: 'Connectors' },
  });
});

it('exposes vertical camera framing independently from zoom', () => {
  expect(meta.argTypes.cameraTargetOffsetY).toMatchObject({
    control: { max: 10, min: -10, step: 0.1, type: 'range' },
    description: 'Shift the camera target vertically without changing scene scale or depth.',
    name: 'Camera target Y offset',
    table: { category: 'Placement & Camera' },
  });
});
