import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/nextjs-vite';

import { createHomepagePresetPersistencePlugin } from './homepagePresetMiddleware.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  async viteFinal(viteConfig) {
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []),
      createHomepagePresetPersistencePlugin({ projectRoot }),
    ];
    return viteConfig;
  },
};

export default config;
