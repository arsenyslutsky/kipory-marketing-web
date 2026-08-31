import { expect, it } from 'vitest';

it.each([
  ['./FormInput.stories', 'Input'],
  ['./FormTextarea.stories', 'Textarea'],
  ['./FormDropdown.stories', 'Dropdown'],
  ['./FormButton.stories', 'Button'],
] as const)('publishes %s under the Form Controls Storybook section', async (modulePath, name) => {
  const storyModule = await import(/* @vite-ignore */ modulePath).catch(() => undefined);

  expect(storyModule, `${name} stories should exist`).toBeDefined();
  if (!storyModule) return;

  expect(storyModule.default.title).toBe(`Form Controls/${name}`);
  expect(storyModule.Foundation).toBeDefined();
  expect(storyModule.CurrentNextjsApp).toMatchObject({ name: 'Current Next.js App' });
});

it('publishes the existing Next.js button treatments and configuration as controls', async () => {
  const storyModule = await import('./FormButton.stories');

  expect(storyModule.default.argTypes?.variant).toMatchObject({
    control: 'radio',
    options: ['primary', 'secondary', 'outline'],
  });
  expect(storyModule.default.argTypes?.size).toMatchObject({
    control: 'radio',
    options: ['default', 'compact', 'small'],
  });
  expect(storyModule.default.argTypes?.icon).toMatchObject({
    control: 'radio',
    options: ['arrow', 'none'],
  });
  expect(storyModule.default.args).toMatchObject({
    size: 'default',
    icon: 'arrow',
  });
  expect(storyModule.Secondary).toMatchObject({
    name: 'Secondary',
    args: { variant: 'secondary' },
  });
  expect(storyModule.Outline).toMatchObject({
    name: 'Outline',
    args: { variant: 'outline' },
  });
});

it.each([
  './FormInput.stories',
  './FormDropdown.stories',
  './FormTextarea.stories',
] as const)('exposes shared spacing and surface controls in %s', async (modulePath) => {
  const storyModule = await import(/* @vite-ignore */ modulePath);

  expect(storyModule.default.argTypes).toMatchObject({
    padding: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    margin: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    horizontalPadding: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    horizontalMargin: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    fontSize: { control: { type: 'range', min: 10, max: 32, step: 1 } },
    backgroundColor: { control: 'color' },
    backgroundOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    focusedBackgroundColor: { control: 'color' },
    focusedBackgroundOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  });
  expect(storyModule.default.args).toMatchObject({
    padding: 8,
    margin: 8,
    backgroundColor: '#0a0c0b24',
    backgroundOpacity: 1,
    focusedBackgroundColor: '#0a0c0b24',
    focusedBackgroundOpacity: 1,
  });
});

it.each([
  './FormInput.stories',
  './FormDropdown.stories',
  './FormTextarea.stories',
] as const)('keeps the Current Next.js text-entry visuals aligned in %s', async (modulePath) => {
  const storyModule = await import(/* @vite-ignore */ modulePath);

  expect(storyModule.CurrentNextjsApp.args).toMatchObject({
    padding: 9,
    margin: 0,
    horizontalPadding: 10,
    fontSize: 24,
    backgroundColor: '#006838',
    backgroundOpacity: 0.05,
    focusedBackgroundColor: '#006838',
    focusedBackgroundOpacity: 0.25,
  });
});
