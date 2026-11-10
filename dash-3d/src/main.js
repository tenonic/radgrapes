// Starts the game: builds each part, then runs the game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCamera } from "./camera.js";
import { createPlayer } from "./player.js";
import { createRoad } from "./road.js";
import { createInput } from "./input.js";
import { createObstacles } from "./obstacles.js";
import { touching } from "./collision.js";
import { CRASH_PAUSE } from "./config.js";

const { scene, renderer } = createScene();
const camera = createCamera();
const player = createPlayer(scene);
const road = createRoad(scene);
const obstacles = createObstacles(scene);
const input = createInput();

// Keep the picture the right shape when the window is resized.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Seconds left in the pause after a crash. 0 means the run is going.
let crashTimeLeft = 0;

// Start the run over: everything goes back to where it began.
function restart() {
  player.reset();
  obstacles.reset();
}

function playerHitObstacle() {
  const playerBox = player.getHitbox();
  return obstacles.getHitboxes().some((box) => touching(playerBox, box));
}

// The game loop: runs about 60 times per second.
// dt is the time since the last frame, so the speed is the same on fast and slow computers.
const clock = new THREE.Clock();

function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);  // cap it, so a slow frame doesn't cause a big jump

  const jumpPressed = input.consumeJump();  // read every frame, so presses during a crash are thrown away

  if (crashTimeLeft > 0) {
    // Crashed: nothing moves. Wait for the pause to end, then restart.
    crashTimeLeft -= dt;
    if (crashTimeLeft <= 0) {
      crashTimeLeft = 0;
      restart();
    }
  } else {
    if (jumpPressed) player.jump();
    player.update(dt);
    road.update(dt);
    obstacles.update(dt);

    if (playerHitObstacle()) crashTimeLeft = CRASH_PAUSE;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

loop();
