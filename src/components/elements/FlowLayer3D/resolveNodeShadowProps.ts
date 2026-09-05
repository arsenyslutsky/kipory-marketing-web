import type { NodeShadowProps } from './types';

export type ResolvedNodeShadowProps = Required<NodeShadowProps>;

function finiteOr(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? value as number : fallback;
}

export function resolveNodeShadowProps(
  props: NodeShadowProps,
  defaults: ResolvedNodeShadowProps,
): ResolvedNodeShadowProps {
  const lightX = finiteOr(props.nodeShadowLightX, defaults.nodeShadowLightX);
  const lightY = finiteOr(props.nodeShadowLightY, defaults.nodeShadowLightY);
  const lightZ = finiteOr(props.nodeShadowLightZ, defaults.nodeShadowLightZ);
  const lightHasDirection = Math.hypot(lightX, lightY, lightZ) > 0.0001;

  return {
    nodeShadowBias: finiteOr(props.nodeShadowBias, defaults.nodeShadowBias),
    nodeShadowBlurSamples: Math.round(Math.min(
      32,
      Math.max(1, finiteOr(props.nodeShadowBlurSamples, defaults.nodeShadowBlurSamples)),
    )),
    nodeShadowColor: props.nodeShadowColor?.trim() || defaults.nodeShadowColor,
    nodeShadowLightX: lightHasDirection ? lightX : defaults.nodeShadowLightX,
    nodeShadowLightY: lightHasDirection ? lightY : defaults.nodeShadowLightY,
    nodeShadowLightZ: lightHasDirection ? lightZ : defaults.nodeShadowLightZ,
    nodeShadowNormalBias: Math.max(
      0,
      finiteOr(props.nodeShadowNormalBias, defaults.nodeShadowNormalBias),
    ),
    nodeShadowOpacity: Math.min(
      1,
      Math.max(0, finiteOr(props.nodeShadowOpacity, defaults.nodeShadowOpacity)),
    ),
    nodeShadowRadius: Math.max(0, finiteOr(props.nodeShadowRadius, defaults.nodeShadowRadius)),
  };
}
