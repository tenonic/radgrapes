// The camera sits behind and above the player, looking forward down the road.
import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    70,                                      // field of view, in degrees
    window.innerWidth / window.innerHeight,  // screen shape
    0.1,                                     // nearest distance it can see
    200                                      // farthest distance it can see
  );

  camera.position.set(0, 3, 6);   // x: centered, y: above, z: behind the player
  camera.lookAt(0, 1, -6);        // look a little ahead of the player

  return camera;
}
