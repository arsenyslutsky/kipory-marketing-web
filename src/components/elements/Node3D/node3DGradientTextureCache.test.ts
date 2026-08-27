import * as THREE from 'three';
import { expect, it, vi } from 'vitest';
import {
  disposeNode3DGradientTextures,
  getNode3DGradientTexture,
  isNode3DManagedGradientTexture,
} from './node3DGradientTextureCache';

it('reuses textures per renderer and disposes them only at renderer teardown', () => {
  const rendererA = {} as THREE.WebGLRenderer;
  const rendererB = {} as THREE.WebGLRenderer;
  const textureA = new THREE.CanvasTexture(document.createElement('canvas'));
  const textureB = new THREE.CanvasTexture(document.createElement('canvas'));
  vi.spyOn(textureA, 'dispose');
  vi.spyOn(textureB, 'dispose');

  expect(getNode3DGradientTexture(rendererA, 'green', () => textureA)).toBe(textureA);
  expect(getNode3DGradientTexture(rendererA, 'green', () => textureB)).toBe(textureA);
  expect(getNode3DGradientTexture(rendererB, 'green', () => textureB)).toBe(textureB);
  expect(isNode3DManagedGradientTexture(textureA)).toBe(true);

  disposeNode3DGradientTextures(rendererA);
  expect(textureA.dispose).toHaveBeenCalledOnce();
  expect(textureB.dispose).not.toHaveBeenCalled();
});
