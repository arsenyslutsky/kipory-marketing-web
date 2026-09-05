import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MaskedBackground } from './MaskedBackground';
import styles from './MaskedBackground.module.css';

it.each([
  [50, 500, '50% 500%'],
  [500, 50, '500% 50%'],
  [100, 275, '100% 275%'],
] as const)('renders independent mask dimensions %s by %s without moving its center', (maskWidth, maskHeight, size) => {
  const { container } = render(<MaskedBackground variant="pillars" maskWidth={maskWidth} maskHeight={maskHeight} maskCenterX={93} />);
  expect(container.firstChild).toHaveStyle({
    '--masked-background-size': size,
    '--masked-background-offset-x': '43cqw',
    '--masked-background-offset-y': '0cqh',
  });
});

it('uses the legacy size only for dimensions that have not been supplied', () => {
  const { container } = render(<MaskedBackground variant="delivery" maskSize={103} maskWidth={250} />);
  expect(container.firstChild).toHaveStyle({ '--masked-background-size': '250% 103%' });
});

it('defaults to a centered rectangular mask at full opacity', () => {
  const { container } = render(<MaskedBackground variant="pillars" />);
  expect(container.firstChild).toHaveAttribute('data-mask-shape', 'rectangle');
  expect(container.firstChild).toHaveStyle({
    '--masked-background-opacity': '1',
    '--masked-background-offset-x': '0cqw',
    '--masked-background-offset-y': '0cqh',
  });
});

it.each(['rectangle', 'ellipsis'] as const)('positions %s content independently of its size and keeps zero opacity', (maskShape) => {
  const { container, rerender } = render(
    <MaskedBackground variant="delivery" maskShape={maskShape} maskSize={100} maskOpacity={0} maskCenterX={25} maskCenterY={80} />,
  );
  expect(container.firstChild).toHaveAttribute('data-mask-shape', maskShape);
  expect(container.firstChild).toHaveStyle({
    '--masked-background-opacity': '0',
    '--masked-background-offset-x': '-25cqw',
    '--masked-background-offset-y': '30cqh',
  });
  rerender(<MaskedBackground variant="delivery" maskShape={maskShape} maskSize={30} maskOpacity={0.4} maskCenterX={25} maskCenterY={80} />);
  expect(container.firstChild).toHaveStyle({
    '--masked-background-opacity': '0.4',
    '--masked-background-offset-x': '-25cqw',
    '--masked-background-offset-y': '30cqh',
  });
});

it.each([
  ['hero', true], ['pillars', true], ['delivery', false],
] as const)('preserves the default mask direction for %s and allows either override', (variant, defaultInvert) => {
  const { container, rerender } = render(<MaskedBackground variant={variant} />);
  expect(container.firstChild).toHaveAttribute('data-mask-inverted', String(defaultInvert));
  for (const invert of [false, true]) {
    rerender(<MaskedBackground variant={variant} invert={invert} />);
    expect(container.firstChild).toHaveAttribute('data-mask-inverted', String(invert));
  }
});

it('does not add a flat grid over the hero illustration', () => {
  const { container } = render(<MaskedBackground variant="hero" />);
  expect(container.querySelector(`.${styles.grid}`)).toBeNull();
});

it.each([
  ['pillars', '0.4'],
  ['delivery', '0.22'],
] as const)('gives %s its own default grid strength', (variant, opacity) => {
  const { container } = render(<MaskedBackground variant={variant} />);
  expect(container.firstChild).toHaveStyle({ '--masked-background-grid-opacity': opacity });
  expect(container.querySelector(`.${styles.grid}`)).toBeInTheDocument();
});

it('converts adjustable mask and grid controls to the rendering variables', () => {
  const { container } = render(
    <MaskedBackground variant="delivery" maskSize={70} gridSize={32} gridOpacity={0.5} />,
  );
  expect(container.firstChild).toHaveStyle({
    '--masked-background-size': '70% 70%',
    '--masked-background-grid-size': '32px',
    '--masked-background-grid-opacity': '0.5',
  });
});
