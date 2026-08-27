import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { isNode3DManagedGradientTexture } from '../Node3D/node3DGradientTextureCache';

type DisposeFlowLayer3DObjectResourcesOptions = {
  excludedTextures?: ReadonlySet<THREE.Texture>;
};

function disposeTexture(
  texture: THREE.Texture,
  disposedTextures: Set<THREE.Texture>,
  excludedTextures: ReadonlySet<THREE.Texture> | undefined,
) {
  if (
    disposedTextures.has(texture)
    || excludedTextures?.has(texture)
    || isNode3DManagedGradientTexture(texture)
  ) return;
  disposedTextures.add(texture);
  texture.dispose();
}

function disposeMaterial(
  material: THREE.Material,
  disposedMaterials: Set<THREE.Material>,
  disposedTextures: Set<THREE.Texture>,
  excludedTextures: ReadonlySet<THREE.Texture> | undefined,
) {
  if (disposedMaterials.has(material)) return;
  disposedMaterials.add(material);
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) disposeTexture(value, disposedTextures, excludedTextures);
  });
  if (material instanceof THREE.ShaderMaterial) {
    Object.values(material.uniforms).forEach(({ value }) => {
      if (value instanceof THREE.Texture) disposeTexture(value, disposedTextures, excludedTextures);
    });
  }
  material.dispose();
}

export function disposeFlowLayer3DObjectResources(
  root: THREE.Object3D,
  { excludedTextures }: DisposeFlowLayer3DObjectResourcesOptions = {},
): void {
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  const disposedMaterials = new Set<THREE.Material>();
  const disposedTextures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (object instanceof CSS3DObject) object.element.remove();
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Sprite)) {
      return;
    }
    if (object.geometry && !disposedGeometries.has(object.geometry)) {
      disposedGeometries.add(object.geometry);
      object.geometry.dispose();
    }
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material && disposeMaterial(
      material,
      disposedMaterials,
      disposedTextures,
      excludedTextures,
    ));
  });
}
