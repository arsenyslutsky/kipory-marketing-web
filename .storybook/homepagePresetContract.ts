export const HOMEPAGE_PRESET_ENDPOINT = '/__kipory/homepage-presets';
export const HOMEPAGE_PRESET_SAVE_HEADER = 'X-Kipory-Storybook-Save';

export const HOMEPAGE_PRESET_STORY_IDS = [
  'animated-illustrations-businessflow3d--current-nextjs-app',
  'animated-illustrations-businessflowvertical--current-nextjs-app',
  'animated-illustrations-businessflowhorizontal--current-nextjs-app',
] as const;

export type HomepagePresetStoryId = (typeof HOMEPAGE_PRESET_STORY_IDS)[number];
export type HomepagePresetArgs = Record<string, unknown>;
export type HomepagePresetArgTypes = Record<string, { table?: { disable?: boolean } }>;

export function isHomepagePresetStoryId(
  value: string | undefined,
): value is HomepagePresetStoryId {
  return (
    typeof value === 'string' &&
    HOMEPAGE_PRESET_STORY_IDS.includes(value as HomepagePresetStoryId)
  );
}

export function filterHomepagePresetArgs(
  args: Record<string, unknown>,
  argTypes: HomepagePresetArgTypes,
): HomepagePresetArgs {
  return Object.fromEntries(
    Object.keys(argTypes)
      .filter((name) => argTypes[name]?.table?.disable !== true && name in args)
      .filter((name) => typeof args[name] !== 'function')
      .map((name) => [name, args[name]]),
  );
}

export function createHomepagePresetCapabilityRequest() {
  return {
    url: HOMEPAGE_PRESET_ENDPOINT,
    init: { method: 'GET' } satisfies RequestInit,
  };
}

export function createHomepagePresetSaveRequest(
  storyId: HomepagePresetStoryId,
  args: HomepagePresetArgs,
) {
  return {
    url: HOMEPAGE_PRESET_ENDPOINT,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [HOMEPAGE_PRESET_SAVE_HEADER]: '1',
      },
      body: JSON.stringify({ storyId, args }),
    } satisfies RequestInit,
  };
}
