import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { GlowLink } from './GlowLink';

it('projects glow controls onto the interactive link without changing its navigation', () => {
  render(
    <GlowLink
      glowActive
      glowBlur={24}
      glowColor="#5fd85a"
      glowDuration={7.5}
      glowEdgeColor="#245c22"
      glowEdgeDuration={5.25}
      glowHoverOpacity={0.94}
      glowIdleOpacity={0.35}
      glowSpread={20}
      href="/waitlist"
    >
      Join waiting list
    </GlowLink>,
  );

  const link = screen.getByRole('link', { name: 'Join waiting list' });
  expect(link).toHaveAttribute('href', '/waitlist');
  expect(link).toHaveAttribute('data-glow-active', 'true');
  expect(link).toHaveStyle({
    '--glow-link-blur': '24px',
    '--glow-link-color': '#5fd85a',
    '--glow-link-duration': '7.5s',
    '--glow-link-edge-color': '#245c22',
    '--glow-link-edge-duration': '5.25s',
    '--glow-link-hover-opacity': '0.94',
    '--glow-link-idle-opacity': '0.35',
    '--glow-link-spread': '20px',
  });
});
