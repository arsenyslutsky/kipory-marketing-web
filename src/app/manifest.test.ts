import { describe, expect, it } from 'vitest';
import manifest, { dynamic } from './manifest';

describe('web app manifest', () => {
  it('is emitted during the static export build', () => {
    expect(dynamic).toBe('force-static');
  });

  it('publishes installable Kipory icons with standard and maskable purposes', () => {
    expect(manifest()).toEqual({
      name: 'Kipory',
      short_name: 'Kipory',
      description: 'Kipory gives product and operations teams a live, traceable view of every workflow moving through their business.',
      start_url: '/',
      display: 'standalone',
      background_color: '#0a0c0b',
      theme_color: '#449c40',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    });
  });
});
