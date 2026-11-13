// The road: a line of tiles in two alternating colors, as long as the map,
// with a white finish line at the end.
// A distance "d" along the road is at z = -d (forward is the -z direction).
import * as THREE from "three";
import { palette, paletteMaterial } from "./palette.js";
import { applyGrid } from "./grid.js";

// Shared with walls.js, so the walls line up with the road.
// (The road's colors come from the palette, so they change with the theme.)
export const TILE_LENGTH = 4;
export const EXTRA_BEHIND = 12;   // road behind the start line, so the camera sees road under it
const TILE_WIDTH = 6;

// A long map has thousands of tiles, so they're drawn as "instanced" meshes
// (one shape drawn many times in one go), one for each of the two colors.
// Returns the road tile meshes (used by the glitch effect).
// grid: give the road the neon grid look (see grid.js).
export function createRoad(parent, length, { grid = false } = {}) {
  const meshes = [];
  const geometry = new THREE.BoxGeometry(TILE_WIDTH, 0.2, TILE_LENGTH);
  const tileCount = Math.ceil((length + EXTRA_BEHIND) / TILE_LENGTH);
  const place = new THREE.Object3D();   // a helper used to work out each tile's position

  palette.road.forEach((color, colorIndex) => {
    const count = Math.ceil((tileCount - colorIndex) / 2);   // tiles of this color
    const material = paletteMaterial(color);
    if (grid) applyGrid(material, 1.5, 1);   // squares of 4 by 4 units
    const tiles = new THREE.InstancedMesh(geometry, material, count);
    let i = 0;
    for (let t = colorIndex; t < tileCount; t += 2) {        // every other tile
      const startOfTile = -EXTRA_BEHIND + t * TILE_LENGTH;
      place.position.set(0, -0.1, -(startOfTile + TILE_LENGTH / 2));   // top of the tile is at y = 0
      place.updateMatrix();
      tiles.setMatrixAt(i++, place.matrix);
    }
    parent.add(tiles);
    meshes.push(tiles);
  });

  // Finish line: a thin white strip across the road.
  const finish = new THREE.Mesh(
    new THREE.BoxGeometry(TILE_WIDTH, 0.22, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  finish.position.set(0, -0.1, -length);
  parent.add(finish);
  return meshes;
}
