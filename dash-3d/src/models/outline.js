// Cartoon outlines, shared by the player models.
import * as THREE from "three";

const OUTLINE_COLOR = 0x111122;
const OUTLINE_SCALE = 1.08;   // how much bigger the outline shell is than the part

// Adds a dark outline to a part: a slightly bigger copy of it that only shows its
// inside faces, so it peeks out around the edges like a drawn outline.
export function withOutline(mesh, scale = OUTLINE_SCALE) {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide })
  );
  outline.scale.setScalar(scale);
  mesh.add(outline);
  return mesh;
}

// Cartoon-style shading: flat bands of light instead of smooth gradients.
// glow: 0 = none, 1 = fully lit by itself.
export function toon(color, glow = 0) {
  return new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: glow });
}
