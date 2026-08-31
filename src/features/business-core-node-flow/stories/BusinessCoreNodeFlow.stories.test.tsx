import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { businessCoreNodeFlowContactProps } from '../presets';
import coreMeta, { CurrentNextjsApp } from './BusinessCoreNodeFlow.stories';

const connectorControlKeys = [
  'connectorColor',
  'connectorOpacity',
  'connectorStroke',
  'connectorWidth',
];

const beamControlKeys = [
  'beamEnabled',
  'beamColor',
  'beamHighlightColor',
  'beamGlowIntensity',
  'beamWidth',
  'beamSpeed',
  'beamEmissionRandomness',
  'beamHeadGlowRadius',
  'beamHeadGlowOpacity',
  'beamHeadGlowBlur',
  'beamTrailLength',
  'maxConcurrentBeams',
];

describe('BusinessCoreNodeFlow Storybook preview', () => {
  it('mirrors the contact-page preset through the Current Next.js App story', () => {
    expect(CurrentNextjsApp.name).toBe('Current Next.js App');
    expect(CurrentNextjsApp.args).toBe(businessCoreNodeFlowContactProps);
    expect(CurrentNextjsApp.parameters?.homepagePreset).toEqual({
      keys: Object.keys(businessCoreNodeFlowContactProps),
    });
  });

  it('mirrors an independent waitlist preset through Current Next.js App 2', async () => {
    const [storyModule, presetModule] = await Promise.all([
      import('./BusinessCoreNodeFlow.stories'),
      import('../presets'),
    ]);
    const currentNextjsApp2 = (storyModule as unknown as Record<string, {
      args?: unknown;
      name?: string;
      parameters?: { homepagePreset?: unknown };
    }>).CurrentNextjsApp2;
    const waitlistProps = (presetModule as unknown as Record<string, unknown>)
      .businessCoreNodeFlowWaitlistProps;

    expect(waitlistProps).toBeDefined();
    expect(waitlistProps).not.toBe(businessCoreNodeFlowContactProps);
    expect(currentNextjsApp2).toBeDefined();
    expect(currentNextjsApp2?.name).toBe('Current Next.js App 2');
    expect(currentNextjsApp2?.args).toBe(waitlistProps);
    expect(currentNextjsApp2?.parameters?.homepagePreset).toEqual({
      keys: Object.keys(waitlistProps as object),
    });
  });

  it('offers typed core and auxiliary icon dropdowns', () => {
    expect(coreMeta.argTypes.centralIcon).toMatchObject({
      control: 'select',
      options: ['intelligence', 'server', 'graph', 'vector', 'download', 'profile', 'profile-alt'],
      table: { category: 'Nodes' },
    });
    expect(coreMeta.argTypes.auxiliaryIcon).toMatchObject({
      control: 'select',
      options: ['mixed', 'intelligence', 'server', 'graph', 'vector', 'download', 'profile', 'profile-alt'],
      table: { category: 'Nodes' },
    });
  });

  it('uses constrained controls for workflow runtime options', () => {
    expect(coreMeta.argTypes.activityStrategy).toMatchObject({
      control: 'inline-radio',
      options: ['visible', 'always'],
      table: { category: 'Runtime' },
    });
    expect(coreMeta.argTypes.loadStrategy).toMatchObject({
      control: 'inline-radio',
      options: ['eager', 'near-viewport'],
      table: { category: 'Runtime' },
    });
    expect(coreMeta.argTypes.resolutionScale).toMatchObject({
      control: 'select',
      options: ['display', 0.5, 0.75, 1, 1.5, 2],
      table: { category: 'Runtime' },
    });
  });

  it('exposes the complete flow connector and beam controls', () => {
    expect(Object.keys(coreMeta.argTypes)).toEqual(expect.arrayContaining([
      ...connectorControlKeys,
      ...beamControlKeys,
    ]));
  });

  it('exposes bounded connection count and auxiliary-node visibility controls', () => {
    expect(coreMeta.argTypes.numberOfAuxiliaryConnections).toMatchObject({
      control: { type: 'range', min: 0, max: 24, step: 1 },
      table: { category: 'Auxiliary Connections' },
    });
    expect(coreMeta.argTypes.showAuxiliaryNodes).toMatchObject({
      control: 'boolean',
      table: { category: 'Auxiliary Connections' },
    });
  });

  it('centers the square illustration in a fullscreen preview', () => {
    expect(coreMeta.parameters.layout).toBe('fullscreen');
    const decorator = coreMeta.decorators?.[0];
    expect(decorator).toBeDefined();

    const preview = decorator?.(() => <span>Core flow preview</span>);
    render(preview);

    expect(screen.getByText('Core flow preview').parentElement).toHaveStyle({
      minHeight: '100vh',
      width: '100%',
    });
  });
});
