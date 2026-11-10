// The player: a cube sitting on the road.
// It stays in place; the road moves toward it instead.
import * as THREE from "three";

const SIZE = 1;

export function createPlayer(scene) {
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.set(0, SIZE / 2, 0);   // bottom of the cube touches the road
  scene.add(cube);

  return cube;
}
