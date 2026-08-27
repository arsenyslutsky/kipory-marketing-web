import { describe, expect, it } from 'vitest';
import { styleNode3DIconSvg } from './styleNode3DIconSvg';

function parse(markup: string) {
  return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
}

describe('styleNode3DIconSvg', () => {
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
