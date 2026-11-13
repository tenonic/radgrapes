// Side walls: run along both edges of the road for the whole map.
// They're in the world group, so they scroll toward the player with everything else.
// They look like the road: panels in the road's two colors, lined up with the road tiles.
//
// There are hundreds of panels, so they're drawn as "instanced" meshes: one shape,
// drawn many times in different places in one go. That keeps the game fast.
import * as THREE from "three";
import { TILE_LENGTH, EXTRA_BEHIND } from "./road.js";
import { palette, paletteMaterial } from "./palette.js";
import { applyGrid } from "./grid.js";

const ROAD_HALF_WIDTH = 3;
const THICKNESS = 0.2;
// Taller than the screen: the top edge is always above the view or hidden in the fog.
const HEIGHT = 50;
// The sun shines from above, so the walls (which face sideways) would look much darker
// than the road. A bit of glow in their own color makes them look like the road.
const GLOW = 0.25;
// Walls further than this ahead of the player aren't drawn. That far out, the fog has
// already turned them the exact color of the sky, so nothing changes for the eye,
// but it lets far-away backgrounds (see background.js) show above the horizon instead
// of being hidden behind the tall walls. (The camera is 6 units behind the player,
// and the fog is complete 90 units from the camera.)
const VIEW_DISTANCE = 84;

// Returns the wall meshes (used by the glitch effect).
// grid: give the walls the neon grid look (see grid.js).
export function createWalls(parent, length, { grid = false } = {}) {
  const meshes = [];
  const panelCount = Math.ceil((length + EXTRA_BEHIND) / TILE_LENGTH);
  const geometry = new THREE.BoxGeometry(THICKNESS, HEIGHT, TILE_LENGTH);
  const place = new THREE.Object3D();   // a helper used to work out each copy's position

  // The walls use the road's colors the other way around, so each wall panel is the
  // opposite color of the road tile beside it, like a checkerboard.
  const wallColors = [palette.road[1], palette.road[0]];

  // One instanced mesh per color: even panels in the first color, odd ones in the second.
  wallColors.forEach((color, colorIndex) => {
    const material = paletteMaterial(color, GLOW);
    if (grid) applyGrid(material, 1, HEIGHT / TILE_LENGTH);   // squares of 4 by 4 units
    // Cut off everything further ahead than VIEW_DISTANCE (z below -VIEW_DISTANCE).
    material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), VIEW_DISTANCE)];
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
    meshes.push(panels);
  });
  return meshes;
}
