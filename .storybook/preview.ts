import type { Preview } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import './fonts.css';
import '../src/app/typography.css';
import '../src/app/globals.css';

const preview: Preview = {
  decorators: [
    (Story) => createElement('div', { className: 'storybook-fonts' }, createElement(Story)),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'todo' },
  },
};

export default preview;
