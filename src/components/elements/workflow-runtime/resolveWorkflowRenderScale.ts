const minimumRenderScale = 0.5;

function clampScale(value: number) {
  return Math.min(1, Math.max(minimumRenderScale, value));
}

export function resolveWorkflowRenderScale(
  element: HTMLElement,
  resolutionScale: 'display' | number = 'display',
) {
  if (typeof resolutionScale === 'number') {
    return clampScale(Number.isFinite(resolutionScale) ? resolutionScale : 1);
  }

  const rect = element.getBoundingClientRect();
  const ratios = [
    element.clientWidth > 0 ? rect.width / element.clientWidth : 1,
    element.clientHeight > 0 ? rect.height / element.clientHeight : 1,
  ].filter((ratio) => Number.isFinite(ratio) && ratio > 0);

  return clampScale(ratios.length > 0 ? Math.min(...ratios) : 1);
}
