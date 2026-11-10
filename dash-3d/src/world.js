// The world: a group that holds the road, the obstacles and the finish line.
// The player never moves forward. Instead, the whole world slides toward the
// player, so moving the group moves everything in it together.
import * as THREE from "three";

export function createWorld(scene) {
  const group = new THREE.Group();
  scene.add(group);

  let distance = 0;   // how far along the road the player has gone

  function update(dt, speed) {
    distance += speed * dt;
    group.position.z = distance;
    group.updateMatrixWorld();   // so hit checks use this frame's positions
  }

  function reset() {
    distance = 0;
    group.position.z = 0;
    group.updateMatrixWorld();
  }

  function getDistance() {
    return distance;
  }

  return { group, update, reset, getDistance };
}
