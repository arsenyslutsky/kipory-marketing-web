import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { expect, it, vi } from 'vitest';
import { getNode3DGradientTexture } from '../Node3D/node3DGradientTextureCache';
import { disposeFlowLayer3DObjectResources } from './disposeFlowLayer3DObjectResources';

it('disposes owned render resources while retaining renderer-managed gradients and removing CSS3D elements', () => {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry();
  const ordinaryTexture = new THREE.Texture();
  const managedTexture = getNode3DGradientTexture(
    {} as THREE.WebGLRenderer,
    'test-gradient',
    () => new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const material = new THREE.MeshBasicMaterial({ map: ordinaryTexture });
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: { gradient: { value: managedTexture } },
  });
  const mesh = new THREE.Mesh(geometry, [material, shaderMaterial]);
  const element = document.createElement('div');
  const cssObject = new CSS3DObject(element);
  document.body.append(element);
  root.add(mesh, cssObject);

  const disposeGeometry = vi.spyOn(geometry, 'dispose');
  const disposeMaterial = vi.spyOn(material, 'dispose');
  const disposeShaderMaterial = vi.spyOn(shaderMaterial, 'dispose');
  const disposeOrdinaryTexture = vi.spyOn(ordinaryTexture, 'dispose');
  const disposeManagedTexture = vi.spyOn(managedTexture, 'dispose');

  disposeFlowLayer3DObjectResources(root);

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
  expect(disposeShaderMaterial).toHaveBeenCalledOnce();
  expect(disposeOrdinaryTexture).toHaveBeenCalledOnce();
  expect(disposeManagedTexture).not.toHaveBeenCalled();
  expect(element.isConnected).toBe(false);
});
