// The live colors of the world: the sky, the road (two shades), and raised blocks.
// The road, walls, ceilings, blocks and sky all use these exact color objects for
// their materials, so changing a color here changes it everywhere on the next frame.
// themes.js is what changes them.
import * as THREE from "three";

export const palette = {
  sky: new THREE.Color(),
  road: [new THREE.Color(), new THREE.Color()],   // the two alternating road shades
  block: new THREE.Color()
};

// A material that uses a palette color. glow: how much it lights itself in that color.
export function paletteMaterial(color, glow = 0) {
  const material = new THREE.MeshStandardMaterial();
  material.color = color;              // shared, not copied, so it follows palette changes
  if (glow > 0) {
    material.emissive = color;
    material.emissiveIntensity = glow;
  }
  return material;
}
