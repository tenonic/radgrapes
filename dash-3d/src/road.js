// The road: a line of tiles in two alternating colors.
// Every frame the tiles move toward the camera. A tile that passes behind the
// camera jumps to the far end, so the road never runs out.
import * as THREE from "three";
import { SPEED, BEHIND_CAMERA_Z } from "./config.js";

const TILE_LENGTH = 4;
const TILE_WIDTH = 6;
const TILE_COUNT = 30;          // 30 tiles x 4 = 120 units of road
const COLORS = [0x5a2d82, 0x3d1d5c];

export function createRoad(scene) {
  const geometry = new THREE.BoxGeometry(TILE_WIDTH, 0.2, TILE_LENGTH);
  const tiles = [];

  for (let i = 0; i < TILE_COUNT; i++) {
    const material = new THREE.MeshStandardMaterial({ color: COLORS[i % 2] });
    const tile = new THREE.Mesh(geometry, material);
    tile.position.set(0, -0.1, BEHIND_CAMERA_Z - i * TILE_LENGTH);  // top of the tile is at y = 0
    scene.add(tile);
    tiles.push(tile);
  }

  // dt: seconds since the last frame.
  function update(dt) {
    for (const tile of tiles) {
      tile.position.z += SPEED * dt;
      if (tile.position.z > BEHIND_CAMERA_Z) {
        tile.position.z -= TILE_COUNT * TILE_LENGTH;
      }
    }
  }

  return { update };
}
