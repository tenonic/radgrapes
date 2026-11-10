// Obstacles: for now, one example spike.
// It moves toward the player at the same speed as the road. Once it's behind
// the camera, it goes back to the far end and comes again.
import * as THREE from "three";
import { SPEED, BEHIND_CAMERA_Z } from "./config.js";
import { getHitbox } from "./collision.js";

const START_Z = -60;         // where the spike starts, far down the road
const SPIKE_HEIGHT = 1;
const SPIKE_HITBOX_SHRINK = 0.15;

// A spike is a 4-sided cone: a pyramid.
function createSpike() {
  const geometry = new THREE.ConeGeometry(0.5, SPIKE_HEIGHT, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0xff3366 });
  const spike = new THREE.Mesh(geometry, material);
  spike.rotation.y = Math.PI / 4;      // turn it so a flat side faces the player
  spike.position.y = SPIKE_HEIGHT / 2; // bottom of the spike sits on the road
  return spike;
}

export function createObstacles(scene) {
  const spike = createSpike();
  scene.add(spike);

  function reset() {
    spike.position.z = START_Z;
  }

  function update(dt) {
    spike.position.z += SPEED * dt;
    if (spike.position.z > BEHIND_CAMERA_Z) reset();
  }

  // The hitboxes of all obstacles, for checking if the player hit one.
  function getHitboxes() {
    return [getHitbox(spike, SPIKE_HITBOX_SHRINK)];
  }

  reset();
  return { update, reset, getHitboxes };
}
