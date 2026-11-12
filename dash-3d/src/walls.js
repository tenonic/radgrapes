// Side walls: run along both edges of the road for the whole map.
// They're in the world group, so they scroll toward the player with everything else.
// They look like the road: panels in the road's two colors, lined up with the road tiles.
//
// There are hundreds of panels, so they're drawn as "instanced" meshes: one shape,
// drawn many times in different places in one go. That keeps the game fast.
import * as THREE from "three";
import { TILE_LENGTH, COLORS, EXTRA_BEHIND } from "./road.js";

const ROAD_HALF_WIDTH = 3;
const THICKNESS = 0.2;
// Taller than the screen: the top edge is always above the view or hidden in the fog.
const HEIGHT = 50;
// The sun shines from above, so the walls (which face sideways) would look much darker
// than the road. A bit of glow in their own color makes them look like the road.
const GLOW = 0.25;

export function createWalls(parent, length) {
  const panelCount = Math.ceil((length + EXTRA_BEHIND) / TILE_LENGTH);
  const geometry = new THREE.BoxGeometry(THICKNESS, HEIGHT, TILE_LENGTH);
  const place = new THREE.Object3D();   // a helper used to work out each copy's position

  // The walls use the road's colors the other way around, so each wall panel is the
  // opposite color of the road tile beside it, like a checkerboard.
  const wallColors = [COLORS[1], COLORS[0]];

  // One instanced mesh per color: even panels in the first color, odd ones in the second.
  wallColors.forEach((color, colorIndex) => {
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: GLOW });
    const count = Math.ceil((panelCount - colorIndex) / 2) * 2;   // panels of this color, both sides
    const panels = new THREE.InstancedMesh(geometry, material, count);

    let i = 0;
    for (let p = colorIndex; p < panelCount; p += 2) {
      const startOfPanel = -EXTRA_BEHIND + p * TILE_LENGTH;
      for (const side of [-1, 1]) {
        place.position.set(side * (ROAD_HALF_WIDTH + THICKNESS / 2), HEIGHT / 2, -(startOfPanel + TILE_LENGTH / 2));
        place.updateMatrix();
        panels.setMatrixAt(i++, place.matrix);
      }
    }
    parent.add(panels);
  });
}
