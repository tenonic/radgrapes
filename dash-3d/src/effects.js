// Visual effects: the player shattering into pieces when it crashes, and the camera shake.
import * as THREE from "three";

const PIECE_COUNT = 18;
const PIECE_SIZE = 0.22;
const PIECE_GRAVITY = 20;
const PIECE_LIFE = 0.9;       // seconds until the pieces are gone
const SHAKE_TIME = 0.35;      // seconds the camera shakes
const SHAKE_STRENGTH = 0.25;  // how far the camera moves at the start of the shake

const random = (min, max) => min + Math.random() * (max - min);

export function createEffects(scene, camera) {
  const pieceGeometry = new THREE.BoxGeometry(PIECE_SIZE, PIECE_SIZE, PIECE_SIZE);
  let pieces = [];
  let pieceAge = 0;

  const cameraHome = camera.position.clone();   // where the camera sits when it isn't shaking
  let shakeLeft = 0;

  // The player crashed at "position": break it into pieces and shake the camera.
  function crash(position, color) {
    clear();
    const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 1 });
    for (let i = 0; i < PIECE_COUNT; i++) {
      const mesh = new THREE.Mesh(pieceGeometry, material);
      mesh.position.set(
        position.x + random(-0.4, 0.4),
        position.y + random(-0.4, 0.4),
        position.z + random(-0.4, 0.4)
      );
      scene.add(mesh);
      pieces.push({
        mesh,
        velocity: new THREE.Vector3(random(-4, 4), random(2, 7), random(-4, 3)),
        spin: new THREE.Vector3(random(-10, 10), random(-10, 10), random(-10, 10))
      });
    }
    pieceAge = 0;
    shakeLeft = SHAKE_TIME;
  }

  // Move the pieces and the camera shake forward by dt seconds.
  function update(dt) {
    if (pieces.length > 0) {
      pieceAge += dt;
      const fade = Math.max(1 - pieceAge / PIECE_LIFE, 0);
      pieces[0].mesh.material.opacity = fade;   // all pieces share one material
      for (const { mesh, velocity, spin } of pieces) {
        velocity.y -= PIECE_GRAVITY * dt;
        mesh.position.addScaledVector(velocity, dt);
        if (mesh.position.y < PIECE_SIZE / 2) {   // bounce off the road, losing speed
          mesh.position.y = PIECE_SIZE / 2;
          velocity.y = Math.abs(velocity.y) * 0.4;
          velocity.x *= 0.7;
          velocity.z *= 0.7;
        }
        mesh.rotation.x += spin.x * dt;
        mesh.rotation.y += spin.y * dt;
        mesh.rotation.z += spin.z * dt;
      }
      if (fade === 0) clear();
    }

    if (shakeLeft > 0) {
      shakeLeft = Math.max(shakeLeft - dt, 0);
      const strength = SHAKE_STRENGTH * (shakeLeft / SHAKE_TIME);   // calms down over time
      camera.position.set(
        cameraHome.x + random(-strength, strength),
        cameraHome.y + random(-strength, strength),
        cameraHome.z
      );
    } else {
      camera.position.copy(cameraHome);
    }
  }

  // Remove any pieces left over.
  function clear() {
    for (const { mesh } of pieces) scene.remove(mesh);
    if (pieces.length > 0) pieces[0].mesh.material.dispose();
    pieces = [];
  }

  return { crash, update, clear };
}
