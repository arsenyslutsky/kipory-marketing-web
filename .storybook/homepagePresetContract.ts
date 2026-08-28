export const HOMEPAGE_PRESET_ENDPOINT = '/__kipory/homepage-presets';
export const HOMEPAGE_PRESET_SAVE_HEADER = 'X-Kipory-Storybook-Save';

export const HOMEPAGE_PRESET_STORY_IDS = [
  'animated-illustrations-businessflow3d--current-nextjs-app',
  'animated-illustrations-businessflowvertical--current-nextjs-app',
  'animated-illustrations-businessflowhorizontal--current-nextjs-app',
  'ui-glowlink--current-nextjs-app',
  'marketing-sitecontainer--current-nextjs-app',
  'marketing-section--current-nextjs-app',
  'marketing-splitlayout--current-nextjs-app',
  'marketing-pagehero--current-nextjs-app',
  'marketing-sectionheader--current-nextjs-app',
  'marketing-numberedrow--current-nextjs-app',
  'marketing-formfield--current-nextjs-app',
] as const;

export type HomepagePresetStoryId = (typeof HOMEPAGE_PRESET_STORY_IDS)[number];
export type HomepagePresetArgs = Record<string, unknown>;
export type HomepagePresetArgTypes = Record<string, { table?: { disable?: boolean } }>;
export type HomepagePresetParameter = { keys: readonly string[] };

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
  presetKeys: readonly string[],
): HomepagePresetArgs {
  return Object.fromEntries(
    presetKeys
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
