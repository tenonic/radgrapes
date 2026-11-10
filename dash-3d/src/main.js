// Starts the game: builds each part, then runs the game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCamera } from "./camera.js";
import { createPlayer } from "./player.js";
import { createRoad } from "./road.js";

const { scene, renderer } = createScene();
const camera = createCamera();
createPlayer(scene);
const road = createRoad(scene);

// Keep the picture the right shape when the window is resized.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// The game loop: runs about 60 times per second.
// dt is the time since the last frame, so the speed is the same on fast and slow computers.
const clock = new THREE.Clock();

function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);  // cap it, so a slow frame doesn't cause a big jump
  road.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

loop();
