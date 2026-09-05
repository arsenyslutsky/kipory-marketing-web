import type { Preview } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import './fonts.css';
import '../src/app/typography.css';
import '../src/app/globals.css';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import type { ThemePreference } from '../src/theme/theme';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme preference',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System', icon: 'browser' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'system' },
  decorators: [
    (Story, context) => createElement(
      ThemeProvider,
      { preference: context.globals.theme as ThemePreference },
      createElement(
        'div',
        {
          className: 'storybook-fonts',
          style: { background: 'var(--surface-base)', color: 'var(--text-primary)', minHeight: '100vh' },
        },
        createElement(Story),
      ),
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'todo' },
  },
};

export default preview;
