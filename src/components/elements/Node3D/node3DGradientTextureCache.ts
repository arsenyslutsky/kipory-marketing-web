import * as THREE from 'three';

const rendererGradientTextures = new WeakMap<THREE.WebGLRenderer, Map<string, THREE.CanvasTexture>>();
const managedGradientTextures = new WeakSet<THREE.Texture>();

export function getNode3DGradientTexture(
  renderer: THREE.WebGLRenderer,
  key: string,
  create: () => THREE.CanvasTexture,
): THREE.CanvasTexture {
  const textures = rendererGradientTextures.get(renderer) ?? new Map<string, THREE.CanvasTexture>();
  rendererGradientTextures.set(renderer, textures);
  const cachedTexture = textures.get(key);
  if (cachedTexture) return cachedTexture;

  const texture = create();
  textures.set(key, texture);
  managedGradientTextures.add(texture);
  return texture;
}

export function isNode3DManagedGradientTexture(texture: THREE.Texture): boolean {
  return managedGradientTextures.has(texture);
}

export function disposeNode3DGradientTextures(renderer: THREE.WebGLRenderer): void {
  const textures = rendererGradientTextures.get(renderer);
  if (!textures) return;

  textures.forEach((texture) => texture.dispose());
  textures.clear();
  rendererGradientTextures.delete(renderer);
}
