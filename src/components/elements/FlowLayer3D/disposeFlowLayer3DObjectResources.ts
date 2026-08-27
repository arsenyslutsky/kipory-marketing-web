import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { isNode3DManagedGradientTexture } from '../Node3D/node3DGradientTextureCache';

function disposeTexture(texture: THREE.Texture) {
  if (!isNode3DManagedGradientTexture(texture)) texture.dispose();
}

function disposeMaterial(material: THREE.Material) {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) disposeTexture(value);
  });
  if (material instanceof THREE.ShaderMaterial) {
    Object.values(material.uniforms).forEach(({ value }) => {
      if (value instanceof THREE.Texture) disposeTexture(value);
    });
  }
  material.dispose();
}

export function disposeFlowLayer3DObjectResources(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (object instanceof CSS3DObject) object.element.remove();
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Sprite)) {
      return;
    }
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material && disposeMaterial(material));
  });
}
