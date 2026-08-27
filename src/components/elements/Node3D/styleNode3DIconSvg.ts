import type { Node3DIconStyle } from './types';

export type { Node3DIconStyle } from './types';

const SVG_NS = 'http://www.w3.org/2000/svg';

function gradientEndpoints(angle: number) {
  const radians = angle * Math.PI / 180;
  const x = Math.cos(radians) * 50;
  const y = Math.sin(radians) * 50;
  return { x1: `${50 - x}%`, y1: `${50 - y}%`, x2: `${50 + x}%`, y2: `${50 + y}%` };
}

export function styleNode3DIconSvg(svg: SVGSVGElement, style: Node3DIconStyle, gradientId: string): void {
  let fill = style.color;
  if (style.fillMode === 'gradient' && style.gradient) {
    const defs = svg.querySelector('defs') ?? document.createElementNS(SVG_NS, 'defs');
    if (!defs.parentNode) svg.prepend(defs);
    const gradient = document.createElementNS(SVG_NS, 'linearGradient');
    gradient.id = gradientId;
    Object.entries(gradientEndpoints(style.gradient.angle)).forEach(([name, value]) => {
      gradient.setAttribute(name, value);
    });
    [
      ['0', style.gradient.start],
      ['0.48', style.gradient.mid],
      ['1', style.gradient.end],
    ].forEach(([offset, color]) => {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      gradient.append(stop);
    });
    defs.append(gradient);
    fill = `url(#${gradientId})`;
  }

  const strokeOpacity = Math.min(1, Math.max(0, style.strokeOpacity));
  svg.querySelectorAll<SVGElement>('[fill]').forEach((element) => {
    if (element.getAttribute('fill') !== 'none') element.setAttribute('fill', fill);
  });
  svg.querySelectorAll<SVGElement>('[stroke]').forEach((element) => {
    if (element.getAttribute('stroke') === 'none') return;
    element.setAttribute('stroke', style.color);
    element.setAttribute('stroke-opacity', String(strokeOpacity));
    if (style.strokeWidth !== undefined && Number.isFinite(style.strokeWidth) && style.strokeWidth >= 0) {
      element.setAttribute('stroke-width', String(style.strokeWidth));
    }
  });
}
