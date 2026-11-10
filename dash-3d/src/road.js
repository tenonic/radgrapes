// The road: a line of tiles in two alternating colors, as long as the map,
// with a white finish line at the end.
// A distance "d" along the road is at z = -d (forward is the -z direction).
import * as THREE from "three";

const TILE_LENGTH = 4;
const TILE_WIDTH = 6;
const COLORS = [0x5a2d82, 0x3d1d5c];
const EXTRA_BEHIND = 12;   // road behind the start line, so the camera sees road under it

export function createRoad(parent, length) {
  const geometry = new THREE.BoxGeometry(TILE_WIDTH, 0.2, TILE_LENGTH);
  const materials = COLORS.map((color) => new THREE.MeshStandardMaterial({ color }));

  const tileCount = Math.ceil((length + EXTRA_BEHIND) / TILE_LENGTH);
  for (let i = 0; i < tileCount; i++) {
    const tile = new THREE.Mesh(geometry, materials[i % 2]);
    const startOfTile = -EXTRA_BEHIND + i * TILE_LENGTH;
    tile.position.set(0, -0.1, -(startOfTile + TILE_LENGTH / 2));   // top of the tile is at y = 0
    parent.add(tile);
  }

  // Finish line: a thin white strip across the road.
  const finish = new THREE.Mesh(
    new THREE.BoxGeometry(TILE_WIDTH, 0.22, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  finish.position.set(0, -0.1, -length);
  parent.add(finish);
}
