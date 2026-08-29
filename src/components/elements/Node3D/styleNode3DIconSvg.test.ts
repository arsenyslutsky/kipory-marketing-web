import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { styleNode3DIconSvg } from './styleNode3DIconSvg';

function parse(markup: string) {
  return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
}

describe('styleNode3DIconSvg', () => {
  it.each([
    ['download.svg', 2],
    ['profile.svg', 3],
    ['profile-alt.svg', 3],
  ])('applies the requested fill to the real %s silhouette while preserving its stroke-only paths', (
    asset,
    strokeOnlyPathCount,
  ) => {
    const markup = readFileSync(
      resolve(process.cwd(), 'public/assets/nodes', asset),
      'utf8',
    );
    const svg = parse(markup);

    styleNode3DIconSvg(svg, {
      color: '#123456',
      fillMode: 'solid',
      strokeColor: '#fedcba',
      strokeOpacity: 0.72,
    }, `${asset}-gradient`);

    expect(svg.querySelector('g')?.getAttribute('fill')).toBe('#123456');
    expect(svg.querySelectorAll('path[fill="#123456"]').length).toBeGreaterThan(0);
    expect(svg.querySelectorAll('path[fill="none"]')).toHaveLength(strokeOnlyPathCount);
    expect(svg.querySelectorAll('path:not([fill="none"])').length).toBeGreaterThan(0);
  });

  it('applies solid fill and stroke controls without filling stroke-only paths', () => {
    const svg = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="filled" fill="#000" stroke="#000"/><path id="line" fill="none" stroke="#000"/></svg>');
    styleNode3DIconSvg(svg, {
      color: '#123456',
      fillMode: 'solid',
      strokeOpacity: 0.4,
      strokeWidth: 2.5,
    }, 'icon-gradient');

    expect(svg.querySelector('#filled')?.getAttribute('fill')).toBe('#123456');
    expect(svg.querySelector('#line')?.getAttribute('fill')).toBe('none');
    expect(svg.querySelectorAll('[stroke]')[0]?.getAttribute('stroke')).toBe('#123456');
    expect(svg.querySelectorAll('[stroke]')[0]?.getAttribute('stroke-opacity')).toBe('0.4');
    expect(svg.querySelectorAll('[stroke]')[0]?.getAttribute('stroke-width')).toBe('2.5');
  });

  it('allows an SVG icon stroke color distinct from its fill color and defaults it to the fill color', () => {
    const distinct = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="icon" fill="#000" stroke="#000"/></svg>');
    styleNode3DIconSvg(distinct, {
      color: '#123456',
      fillMode: 'solid',
      strokeColor: '#fedcba',
      strokeOpacity: 1,
    }, 'distinct-stroke');

    expect(distinct.querySelector('#icon')?.getAttribute('fill')).toBe('#123456');
    expect(distinct.querySelector('#icon')?.getAttribute('stroke')).toBe('#fedcba');

    const legacy = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="icon" fill="#000" stroke="#000"/></svg>');
    styleNode3DIconSvg(legacy, {
      color: '#123456',
      fillMode: 'solid',
      strokeOpacity: 1,
    }, 'legacy-stroke');

    expect(legacy.querySelector('#icon')?.getAttribute('stroke')).toBe('#123456');
  });

  it('injects one gradient and uses it only for non-none fills', () => {
    const svg = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="filled" fill="#000"/><path id="line" fill="none"/></svg>');
    styleNode3DIconSvg(svg, {
      color: '#fff',
      fillMode: 'gradient',
      gradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
      strokeOpacity: 1,
    }, 'node-a-gradient');

    expect(svg.querySelectorAll('linearGradient')).toHaveLength(1);
    expect(svg.querySelector('#filled')?.getAttribute('fill')).toBe('url(#node-a-gradient)');
    expect(svg.querySelector('#line')?.getAttribute('fill')).toBe('none');
    expect([...svg.querySelectorAll('stop')].map((stop) => stop.getAttribute('stop-color')))
      .toEqual(['#066b43', '#03492b', '#052f24']);
  });
});
