// Starts the game: builds each part from the map, then runs the game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCamera } from "./camera.js";
import { createPlayer } from "./player.js";
import { createWorld } from "./world.js";
import { createRoad } from "./road.js";
import { createObstacles } from "./obstacles.js";
import { createInput } from "./input.js";
import { touching } from "./collision.js";
import { CRASH_PAUSE, FINISH_PAUSE } from "./config.js";
import map from "./maps/map1.js";

const { scene, renderer } = createScene();
const camera = createCamera();
const player = createPlayer(scene);
const world = createWorld(scene);
createRoad(world.group, map.length);
const obstacles = createObstacles(world.group, map.obstacles);
const input = createInput();

// Keep the picture the right shape when the window is resized.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Seconds left in a pause (after a crash or a finish). 0 means the run is going.
let pauseTimeLeft = 0;

// Start the map over from the beginning.
function restart() {
  player.reset();
  world.reset();
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
  const jumpPressed = input.consumeJump();     // read every frame, so presses during a pause are thrown away

  if (pauseTimeLeft > 0) {
    // Paused: nothing moves. Wait for the pause to end, then restart.
    pauseTimeLeft -= dt;
    if (pauseTimeLeft <= 0) {
      pauseTimeLeft = 0;
      restart();
    }
  } else {
    if (jumpPressed) player.jump();
    player.update(dt);
    world.update(dt, map.speed);

    if (playerHitObstacle()) {
      pauseTimeLeft = CRASH_PAUSE;
    } else if (world.getDistance() >= map.length) {
      pauseTimeLeft = FINISH_PAUSE;   // made it to the finish line
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

loop();
