// Raised road sections ("blocks"): the player can land on top and run along them,
// but crashes into the front.
import * as THREE from "three";
import { touching } from "./collision.js";
import { palette, paletteMaterial } from "./palette.js";

const WIDTH = 6;            // as wide as the road
// Landing tolerance: if the cube is at most this far below a block's top,
// it gets lifted up onto the block instead of crashing. This makes near-misses fair.
const STEP_UP = 0.15;

export function createBlocks(parent, list) {
  const material = paletteMaterial(palette.block);

  const blocks = list.map(({ at, length, height }) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, height, length), material);
    mesh.position.set(0, height / 2, -(at + length / 2));
    parent.add(mesh);
    return { mesh, height };
  });

  // Is the block under the player, front to back?
  function isUnder(block, playerBox) {
    const box = new THREE.Box3().setFromObject(block.mesh);
    return playerBox.max.z > box.min.z && playerBox.min.z < box.max.z;
  }

  // The height the player can stand on right now: the top of the highest block
  // under the player that the cube is above (or nearly above). 0 is the road.
  function groundHeightUnder(playerBox, playerBottom) {
    let ground = 0;
    for (const block of blocks) {
      if (isUnder(block, playerBox) && playerBottom >= block.height - STEP_UP) {
        ground = Math.max(ground, block.height);
      }
    }
    return ground;
  }

  // Did the player run into the front of a block? The top STEP_UP of each block
  // doesn't count, since landing there lifts the player up instead.
  function hitFront(playerBox) {
    return blocks.some((block) => {
      const box = new THREE.Box3().setFromObject(block.mesh);
      box.max.y -= STEP_UP;
      return touching(playerBox, box);
    });
  }

  return { groundHeightUnder, hitFront };
}
