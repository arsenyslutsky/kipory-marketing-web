import * as THREE from 'three';
import type { ResolvedFlowPath3D } from '../FlowPath3D/types';
import type {
  Beam3DColors,
  Beam3DMode,
  Beam3DStyle,
  PacketCoreShape,
} from './types';

export type Beam3DUniforms = {
  uColor: { value: THREE.Color };
  uProgress: { value: number };
  uStartFade: { value: number };
  uTime: { value: number };
  uVisibility: { value: number };
};

export type Beam3DUpdate = {
  packetVisibility?: number;
  phase?: number;
  progress: number;
  time: number;
  visibility?: number;
};

export type CreateBeam3DObjectOptions = {
  beamWidth?: number;
  colors: Beam3DColors;
  flareTexture: THREE.Texture;
  fogEnabled: boolean;
  glowIntensity?: number;
  mode: Beam3DMode;
  packetCoreShape?: PacketCoreShape;
  packetCoreSize?: number;
  packetHaloBlur?: number;
  packetHaloOpacity?: number;
  packetHaloSize?: number;
  packetShadow?: number;
  packetVisible?: boolean;
  path: ResolvedFlowPath3D;
  softness?: number;
  startFade?: number;
  style: Beam3DStyle;
  trailLength?: number;
};

export type Beam3DObject = {
  aura: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  core: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  glow: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  group: THREE.Group;
  packet: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  packetFlare: THREE.Sprite;
  packetFlareOpacity: number;
  packetHalo: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  packetHaloOpacity: number;
  packetShadow: THREE.Sprite;
  packetShadowOpacity: number;
  position: THREE.Vector3;
  setPath: (path: ResolvedFlowPath3D) => void;
  setVisible: (visible: boolean) => void;
  uniforms: Beam3DUniforms;
  update: (state: Beam3DUpdate) => void;
};

function makeRibbonGeometry(points: THREE.Vector3[], halfWidth: number, yOffset = 0) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const distances = [0];

  for (let index = 1; index < points.length; index++) {
    distances[index] = distances[index - 1] + points[index].distanceTo(points[index - 1]);
  }
  const totalLength = distances.at(-1) || 1;

  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tangent = new THREE.Vector2(next.x - previous.x, next.z - previous.z);
    if (tangent.lengthSq() < 0.000001) tangent.set(next.x - point.x, next.z - point.z);
    if (tangent.lengthSq() < 0.000001) tangent.set(point.x - previous.x, point.z - previous.z);
    tangent.normalize();
    const offset = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(halfWidth);
    const u = distances[index] / totalLength;

    positions.push(point.x + offset.x, point.y + yOffset, point.z + offset.y);
    positions.push(point.x - offset.x, point.y + yOffset, point.z - offset.y);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(u, 0, u, 1);

    if (index < points.length - 1) {
      const a = index * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function makeGlowDiscTrailGeometry(points: THREE.Vector3[], radius: number, spacing: number, yOffset = 0) {
  const geometry = new THREE.BufferGeometry();
  if (points.length < 2) return geometry;
  const segmentLengths: number[] = [];
  const cumulative = [0];
  for (let index = 0; index < points.length - 1; index++) {
    const length = points[index].distanceTo(points[index + 1]);
    segmentLengths.push(length);
    cumulative.push(cumulative[index] + length);
  }
  const totalLength = cumulative.at(-1) || 0;
  if (totalLength < 0.001) return geometry;

  const positions: number[] = [];
  const uvs: number[] = [];
  const pathProgress: number[] = [];
  const indices: number[] = [];
  const sampleCount = Math.max(2, Math.ceil(totalLength / spacing));
  let segmentIndex = 0;

  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex++) {
    const distance = totalLength * (sampleIndex / sampleCount);
    while (segmentIndex < segmentLengths.length - 1 && distance > cumulative[segmentIndex + 1]) {
      segmentIndex += 1;
    }
    const segmentLength = Math.max(segmentLengths[segmentIndex], 0.000001);
    const localProgress = THREE.MathUtils.clamp((distance - cumulative[segmentIndex]) / segmentLength, 0, 1);
    const point = new THREE.Vector3().lerpVectors(points[segmentIndex], points[segmentIndex + 1], localProgress);
    const vertexOffset = positions.length / 3;
    positions.push(
      point.x - radius, point.y + yOffset, point.z - radius,
      point.x + radius, point.y + yOffset, point.z - radius,
      point.x - radius, point.y + yOffset, point.z + radius,
      point.x + radius, point.y + yOffset, point.z + radius,
    );
    uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    const progress = distance / totalLength;
    pathProgress.push(progress, progress, progress, progress);
    indices.push(
      vertexOffset, vertexOffset + 2, vertexOffset + 1,
      vertexOffset + 1, vertexOffset + 2, vertexOffset + 3,
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aPathProgress', new THREE.Float32BufferAttribute(pathProgress, 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function beamMaterial({
  brightness,
  fogEnabled,
  headFeather,
  highlight,
  opacity,
  softness,
  style,
  trailLength,
  uniforms,
}: {
  brightness: number;
  fogEnabled: boolean;
  headFeather: number;
  highlight: string;
  opacity: number;
  softness: number;
  style: Beam3DStyle;
  trailLength: number;
  uniforms: Beam3DUniforms;
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uProgress: uniforms.uProgress,
      uTime: uniforms.uTime,
      uColor: uniforms.uColor,
      uVisibility: uniforms.uVisibility,
      uStartFade: uniforms.uStartFade,
      uHighlight: { value: new THREE.Color(highlight) },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
      uHeadFeather: { value: headFeather },
      uSoftness: { value: softness },
      uRibbon: { value: style === 'ribbon' ? 1 : 0 },
      uTrailLength: { value: trailLength },
    },
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      #include <fog_pars_fragment>
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      uniform float uProgress;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uVisibility;
      uniform float uStartFade;
      uniform vec3 uHighlight;
      uniform float uOpacity;
      uniform float uBrightness;
      uniform float uHeadFeather;
      uniform float uSoftness;
      uniform float uRibbon;
      uniform float uTrailLength;
      void main() {
        float delta = uProgress - vUv.x;
        float gate = smoothstep(0.0, max(uHeadFeather, .0001), delta);
        float trail = (1.0 - smoothstep(0.0, uTrailLength, delta)) * gate;
        float head = exp(-pow((vUv.x - uProgress) / mix(.022, .07, uSoftness), 2.0)) * gate;
        float shimmer = .88 + .12 * sin(vUv.x * 190.0 - uTime * 12.0);
        float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 2.2);
        float softTubeSurface = pow(max(1.0 - fresnel, 0.0), mix(.55, 1.8, uSoftness));
        float tubeSurface = mix(.86 + .14 * fresnel, softTubeSurface, uSoftness);
        float edgeDistance = abs(vUv.y * 2.0 - 1.0);
        float lateral = clamp(1.0 - edgeDistance, 0.0, 1.0);
        float coreSurface = pow(lateral, .55);
        float feather = 1.0 - smoothstep(.68, 1.0, edgeDistance);
        float gaussianSurface = exp(-pow(edgeDistance * 2.15, 2.0)) * feather;
        float ribbonSurface = mix(coreSurface, gaussianSurface, uSoftness);
        float surface = mix(tubeSurface, ribbonSurface, uRibbon);
        float startFade = smoothstep(0.0, max(uStartFade, .0001), vUv.x);
        float alpha = (trail * (.52 + .18 * shimmer) + head * 1.32) * surface * uOpacity * uVisibility * startFade;
        vec3 shine = mix(uColor, uHighlight, smoothstep(.04, .96, head));
        shine += uColor * fresnel * uSoftness * .32;
        if (alpha < .004) discard;
        gl_FragColor = vec4(shine * uBrightness, alpha);
        #include <fog_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
    fog: fogEnabled,
  });
}

function createPacketCoreGeometry(shape: PacketCoreShape, radius: number): THREE.BufferGeometry {
  if (shape === 'circle') return new THREE.SphereGeometry(radius, 24, 16);

  const packetShape = new THREE.Shape();
  const points = shape === 'triangle'
    ? [
      [1, 0],
      [-0.72, 0.72],
      [-0.72, -0.72],
    ]
    : [
      [1.45, 0],
      [0.05, 0.7],
      [0.05, 0.34],
      [-1.3, 0.34],
      [-1.3, -0.34],
      [0.05, -0.34],
      [0.05, -0.7],
    ];

  packetShape.moveTo(points[0][0] * radius, points[0][1] * radius);
  points.slice(1).forEach(([x, y]) => packetShape.lineTo(x * radius, y * radius));
  packetShape.closePath();

  const geometry = new THREE.ExtrudeGeometry(packetShape, {
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: radius * 0.08,
    bevelThickness: radius * 0.08,
    curveSegments: 4,
    depth: radius * 0.28,
    steps: 1,
  });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function packetHaloMaterial({
  blur,
  color,
  fogEnabled,
  mode,
  opacity,
  style,
}: {
  blur: number;
  color: string;
  fogEnabled: boolean;
  mode: Beam3DMode;
  opacity: number;
  style: Beam3DStyle;
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uBlur: { value: blur },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      #include <fog_pars_fragment>
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      uniform float uBlur;
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        float facing = clamp(abs(dot(normalize(vNormalView), normalize(vViewDir))), 0.0, 1.0);
        float blurMix = smoothstep(0.0, 1.0, uBlur);
        float radialFalloff = pow(facing, mix(.35, 1.65, uBlur));
        float blurCompensation = mix(1.0, 1.35, uBlur);
        float alpha = mix(1.0, radialFalloff, blurMix) * uOpacity * blurCompensation;
        if (alpha < .002) discard;
        gl_FragColor = vec4(uColor, alpha);
        #include <fog_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: style === 'ribbon' ? THREE.NormalBlending : (mode === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending),
    toneMapped: false,
    fog: fogEnabled,
  });
}

function beamDiscGlowMaterial({
  brightness,
  fogEnabled,
  highlight,
  opacity,
  trailLength,
  uniforms,
}: {
  brightness: number;
  fogEnabled: boolean;
  highlight: string;
  opacity: number;
  trailLength: number;
  uniforms: Beam3DUniforms;
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uProgress: uniforms.uProgress,
      uColor: uniforms.uColor,
      uVisibility: uniforms.uVisibility,
      uStartFade: uniforms.uStartFade,
      uHighlight: { value: new THREE.Color(highlight) },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
      uTrailLength: { value: trailLength },
    },
    vertexShader: `
      #include <fog_pars_vertex>
      attribute float aPathProgress;
      varying vec2 vUv;
      varying float vPathProgress;
      void main() {
        vUv = uv;
        vPathProgress = aPathProgress;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      #include <fog_pars_fragment>
      varying vec2 vUv;
      varying float vPathProgress;
      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uVisibility;
      uniform float uStartFade;
      uniform vec3 uHighlight;
      uniform float uOpacity;
      uniform float uBrightness;
      uniform float uTrailLength;
      void main() {
        float delta = uProgress - vPathProgress;
        float gate = smoothstep(0.0, .012, delta);
        float trail = (1.0 - smoothstep(0.0, uTrailLength, delta)) * gate;
        float head = exp(-pow((vPathProgress - uProgress) / .055, 2.0)) * gate;
        float radialDistance = length(vUv - vec2(0.5)) * 2.0;
        float radial = exp(-pow(radialDistance * 1.5, 2.0));
        radial *= 1.0 - smoothstep(.72, 1.0, radialDistance);
        float startFade = smoothstep(0.0, max(uStartFade, .0001), vPathProgress);
        float alpha = (trail * .5 + head) * radial * uOpacity * uVisibility * startFade;
        if (alpha < .002) discard;
        vec3 shine = mix(uColor, uHighlight, clamp(head * 1.2, 0.0, 1.0));
        gl_FragColor = vec4(shine * uBrightness, alpha);
        #include <fog_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    toneMapped: false,
    fog: fogEnabled,
  });
}

export function createBeam3DFlareTexture(flareStops: Beam3DColors['flareStops']) {
  const flareCanvas = document.createElement('canvas');
  flareCanvas.width = 256;
  flareCanvas.height = 256;
  const context = flareCanvas.getContext('2d');
  if (!context) throw new Error('Could not create the signal flare texture.');
  const glow = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  glow.addColorStop(0, flareStops[0]);
  glow.addColorStop(0.07, flareStops[1]);
  glow.addColorStop(0.2, flareStops[2]);
  glow.addColorStop(0.52, flareStops[3]);
  glow.addColorStop(1, flareStops[4]);
  context.fillStyle = glow;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(flareCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBeam3DObject({
  beamWidth = 1,
  colors,
  flareTexture,
  fogEnabled,
  glowIntensity = 1,
  mode,
  packetCoreShape = 'circle',
  packetCoreSize = 1,
  packetHaloBlur = 0,
  packetHaloOpacity,
  packetHaloSize = 1,
  packetShadow = 0,
  packetVisible = true,
  path,
  softness = 0.05,
  startFade = 0,
  style,
  trailLength = 0.38,
}: CreateBeam3DObjectOptions): Beam3DObject {
  const resolvedWidth = THREE.MathUtils.clamp(beamWidth, 0.1, 4);
  const resolvedGlow = THREE.MathUtils.clamp(glowIntensity, 0, 3);
  const resolvedSoftness = THREE.MathUtils.clamp(softness, 0, 1);
  const resolvedTrailLength = THREE.MathUtils.clamp(trailLength, 0.02, 1);
  const isRibbon = style === 'ribbon';
  const isDark = mode === 'dark';
  const glowGain = resolvedGlow * (0.7 + 0.3 * resolvedGlow);
  const glowSpread = Math.max(0.65, 1 + (resolvedGlow - 1) * 0.35);
  const tubeSoftnessSpread = Math.pow(resolvedSoftness, 1.35);
  const tubeCoreSoftness = THREE.MathUtils.lerp(0.18, 1, resolvedSoftness);
  const tubeGlowSoftness = THREE.MathUtils.lerp(0.38, 1, resolvedSoftness);
  const tubeAuraSoftness = THREE.MathUtils.lerp(0.58, 1, resolvedSoftness);
  const tubeCoreRadius = THREE.MathUtils.lerp(0.084, 0.055, tubeSoftnessSpread) * resolvedWidth;
  const tubeGlowRadius = THREE.MathUtils.lerp(0.13, 0.38, tubeSoftnessSpread) * resolvedWidth * glowSpread;
  const tubeAuraRadius = THREE.MathUtils.lerp(0.2, 0.68, tubeSoftnessSpread) * resolvedWidth * glowSpread;
  const tubeCoreHeadFeather = THREE.MathUtils.lerp(0.035, 0.18, resolvedSoftness);
  const tubeGlowHeadFeather = THREE.MathUtils.lerp(0.07, 0.28, resolvedSoftness);
  const tubeAuraHeadFeather = THREE.MathUtils.lerp(0.11, 0.38, resolvedSoftness);
  const resolvedPacketCoreSize = THREE.MathUtils.clamp(packetCoreSize, 0, 4);
  const resolvedPacketHaloBlur = THREE.MathUtils.clamp(packetHaloBlur, 0, 1);
  const resolvedPacketHaloSize = THREE.MathUtils.clamp(packetHaloSize, 0, 4);
  const resolvedPacketShadow = THREE.MathUtils.clamp(packetShadow, 0, 1);
  const resolvedPacketHaloOpacity = packetHaloOpacity === undefined
    ? Math.min((isRibbon ? 0.24 : 0.17) * resolvedGlow, 0.85)
    : THREE.MathUtils.clamp(packetHaloOpacity, 0, 1);
  const packetFlareOpacity = Math.min(
    (isRibbon ? (isDark ? 0.92 : 0.58) : (isDark ? 0.5 : 0.38)) * resolvedGlow,
    0.95,
  );
  const uniforms: Beam3DUniforms = {
    uProgress: { value: -0.08 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(colors.beam) },
    uVisibility: { value: 0 },
    uStartFade: { value: THREE.MathUtils.clamp(startFade, 0, 1) },
  };
  const starterCurve = new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 1));
  const core: Beam3DObject['core'] = new THREE.Mesh(
    new THREE.TubeGeometry(starterCurve, 4, isRibbon ? 0.052 * resolvedWidth : tubeCoreRadius, isRibbon ? 12 : 24),
    beamMaterial({
      brightness: isRibbon
        ? (isDark ? 1.7 : 1)
        : THREE.MathUtils.lerp(isDark ? 1.08 : 0.84, isDark ? 0.62 : 0.52, tubeSoftnessSpread),
      fogEnabled,
      headFeather: isRibbon ? 0.012 : tubeCoreHeadFeather,
      highlight: colors.beamHighlight,
      opacity: 1,
      softness: isRibbon ? resolvedSoftness : tubeCoreSoftness,
      style,
      trailLength: resolvedTrailLength,
      uniforms,
    }),
  );
  const glow: Beam3DObject['glow'] = new THREE.Mesh(
    isRibbon ? new THREE.BufferGeometry() : new THREE.TubeGeometry(starterCurve, 4, tubeGlowRadius, 24),
    isRibbon
      ? beamDiscGlowMaterial({
        brightness: isDark ? 1.55 : 0.9,
        fogEnabled,
        highlight: colors.beamHighlight,
        opacity: (isDark ? 0.045 : 0.032) * glowGain,
        trailLength: resolvedTrailLength,
        uniforms,
      })
      : beamMaterial({
        brightness: isDark ? 1.45 : 0.82,
        fogEnabled,
        headFeather: tubeGlowHeadFeather,
        highlight: colors.beamHighlight,
        opacity: Math.min(THREE.MathUtils.lerp(0.08, 0.4, tubeSoftnessSpread) * glowGain, 0.95),
        softness: tubeGlowSoftness,
        style,
        trailLength: resolvedTrailLength,
        uniforms,
      }),
  );
  const aura: Beam3DObject['aura'] = new THREE.Mesh(
    isRibbon ? new THREE.BufferGeometry() : new THREE.TubeGeometry(starterCurve, 4, tubeAuraRadius, 20),
    isRibbon
      ? beamDiscGlowMaterial({
        brightness: isDark ? 1.05 : 0.62,
        fogEnabled,
        highlight: colors.beamHighlight,
        opacity: (isDark ? 0.012 : 0.008) * glowGain,
        trailLength: resolvedTrailLength,
        uniforms,
      })
      : beamMaterial({
        brightness: isDark ? 1.15 : 0.68,
        fogEnabled,
        headFeather: tubeAuraHeadFeather,
        highlight: colors.beamHighlight,
        opacity: Math.min(THREE.MathUtils.lerp(0, 0.12, tubeSoftnessSpread) * glowGain, 0.65),
        softness: tubeAuraSoftness,
        style,
        trailLength: resolvedTrailLength,
        uniforms,
      }),
  );
  const packet = new THREE.Mesh(
    createPacketCoreGeometry(packetCoreShape, (isRibbon ? 0.085 : 0.105) * resolvedWidth),
    new THREE.MeshBasicMaterial({
      color: colors.packetCore,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      toneMapped: false,
      fog: fogEnabled,
    }),
  );
  const packetHalo = new THREE.Mesh(
    new THREE.SphereGeometry((isRibbon ? 0.32 : 0.28) * resolvedWidth, 24, 16),
    packetHaloMaterial({
      blur: resolvedPacketHaloBlur,
      color: colors.packetHalo,
      fogEnabled,
      mode,
      opacity: resolvedPacketHaloOpacity,
      style,
    }),
  );
  const packetShadowOpacity = 0.62 * resolvedPacketShadow;
  const packetShadowObject = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flareTexture,
    color: 0x000000,
    transparent: true,
    opacity: packetShadowOpacity,
    blending: THREE.NormalBlending,
    depthWrite: false,
    toneMapped: false,
    fog: fogEnabled,
  }));
  packetShadowObject.scale.setScalar(
    (isRibbon ? 0.085 : 0.105) * resolvedWidth * resolvedPacketCoreSize * 3,
  );
  const packetFlare = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flareTexture,
    color: colors.flare,
    transparent: true,
    opacity: packetFlareOpacity,
    blending: isRibbon ? THREE.NormalBlending : (isDark ? THREE.AdditiveBlending : THREE.NormalBlending),
    depthWrite: false,
    toneMapped: false,
    fog: fogEnabled,
  }));
  packetFlare.scale.setScalar((isRibbon ? 1.35 : 0.8) * resolvedWidth);
  packetShadowObject.renderOrder = 1;
  packetHalo.renderOrder = 2;
  packet.renderOrder = 3;
  packetFlare.renderOrder = 4;
  const group = new THREE.Group();
  group.add(aura, glow, core, packetShadowObject, packetHalo, packet, packetFlare);
  const position = new THREE.Vector3();
  const packetForward = new THREE.Vector3(1, 0, 0);
  const packetTangent = new THREE.Vector3();
  let currentPath = path;

  function setPath(nextPath: ResolvedFlowPath3D) {
    currentPath = nextPath;
    core.geometry.dispose();
    glow.geometry.dispose();
    aura.geometry.dispose();
    if (isRibbon) {
      core.geometry = makeRibbonGeometry(nextPath.points, 0.055 * resolvedWidth, 0.002);
      glow.geometry = makeGlowDiscTrailGeometry(nextPath.points, 0.24 * resolvedWidth * glowSpread, 0.055, 0.001);
      aura.geometry = makeGlowDiscTrailGeometry(nextPath.points, 0.62 * resolvedWidth * glowSpread, 0.15, 0);
    } else {
      core.geometry = new THREE.TubeGeometry(nextPath.curve, 180, tubeCoreRadius, 24, false);
      glow.geometry = new THREE.TubeGeometry(nextPath.curve, 180, tubeGlowRadius, 24, false);
      aura.geometry = new THREE.TubeGeometry(nextPath.curve, 180, tubeAuraRadius, 20, false);
    }
  }

  function setVisible(visible: boolean) {
    [core, glow, aura].forEach((object) => { object.visible = visible; });
    [packet, packetShadowObject, packetHalo, packetFlare]
      .forEach((object) => { object.visible = visible && packetVisible; });
  }

  function update({
    packetVisibility = 1,
    phase = 0,
    progress,
    time,
    visibility = 1,
  }: Beam3DUpdate) {
    const resolvedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const resolvedPacketVisibility = THREE.MathUtils.clamp(packetVisibility, 0, 1);
    uniforms.uProgress.value = resolvedProgress;
    uniforms.uTime.value = time;
    uniforms.uVisibility.value = THREE.MathUtils.clamp(visibility, 0, 1);
    position.copy(currentPath.curve.getPointAt(resolvedProgress));
    packet.position.copy(position);
    packetShadowObject.position.copy(position);
    packetHalo.position.copy(position);
    packetFlare.position.copy(position);
    currentPath.curve.getTangentAt(resolvedProgress, packetTangent);
    if (packetTangent.lengthSq() > 0.000001) {
      packetTangent.normalize();
      packetShadowObject.position.addScaledVector(
        packetTangent,
        -0.12 * resolvedWidth * Math.max(resolvedPacketCoreSize, 0.5),
      );
      packetShadowObject.position.y -= 0.04 * resolvedWidth;
      if (packetCoreShape !== 'circle') {
        packet.quaternion.setFromUnitVectors(packetForward, packetTangent);
      }
    }
    packet.scale.setScalar(resolvedPacketCoreSize);
    packet.material.opacity = resolvedPacketVisibility;
    packetShadowObject.material.opacity = packetShadowOpacity * resolvedPacketVisibility;
    packetHalo.material.uniforms.uOpacity.value = resolvedPacketHaloOpacity * resolvedPacketVisibility;
    packetFlare.material.opacity = packetFlareOpacity * resolvedPacketVisibility;
    packetHalo.scale.setScalar(
      (0.86 + Math.sin(time * 7 + phase * 0.8) * 0.1) * resolvedPacketHaloSize,
    );
    packetFlare.scale.setScalar(
      ((isRibbon ? 1.35 : 0.8) + Math.sin(time * 5.5 + phase) * (isRibbon ? 0.12 : 0.06)) * resolvedWidth,
    );
  }

  setPath(path);
  setVisible(false);
  return {
    aura,
    core,
    glow,
    group,
    packet,
    packetFlare,
    packetFlareOpacity,
    packetHalo,
    packetHaloOpacity: resolvedPacketHaloOpacity,
    packetShadow: packetShadowObject,
    packetShadowOpacity,
    position,
    setPath,
    setVisible,
    uniforms,
    update,
  };
}
