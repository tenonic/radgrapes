// The player: a cube sitting on the road.
// It stays in place front-to-back (the road moves toward it instead),
// but it can jump up and fall back down.
import * as THREE from "three";
import { getHitbox } from "./collision.js";

const SIZE = 1;
const HITBOX_SHRINK = 0.05;
const GROUND_Y = SIZE / 2;   // cube's center height when its bottom touches the road
// Jump settings. At the normal speed (10), a jump clears at most 3 spikes in a row, never 4.
// The cube goes about 1.57 units high and stays in the air for about 0.56 seconds.
const JUMP_SPEED = 11.2;     // upward speed at the start of a jump (units per second)
const GRAVITY = 40;          // how fast upward speed drains away (units per second, per second)

export function createPlayer(scene) {
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const material = new THREE.MeshStandardMaterial({ color: 0x33ccff });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(0, GROUND_Y, 0);
  scene.add(mesh);

  let velocityY = 0;     // current up/down speed: positive = rising, negative = falling
  let onGround = true;

  // Start a jump, but only from the ground (no jumping in mid-air).
  function jump() {
    if (!onGround) return;
    velocityY = JUMP_SPEED;
    onGround = false;
  }

  // Gravity pulls the speed down every frame, so the cube rises, slows,
  // stops at the top, then falls faster and faster until it lands.
  function update(dt) {
    if (onGround) return;

    velocityY -= GRAVITY * dt;
    mesh.position.y += velocityY * dt;

    if (mesh.position.y <= GROUND_Y) {   // landed
      mesh.position.y = GROUND_Y;
      velocityY = 0;
      onGround = true;
    }
  }

  // Put the cube back on the road, standing still.
  function reset() {
    mesh.position.y = GROUND_Y;
    velocityY = 0;
    onGround = true;
  }

  function getPlayerHitbox() {
    return getHitbox(mesh, HITBOX_SHRINK);
  }

  return { jump, update, reset, getHitbox: getPlayerHitbox };
}
