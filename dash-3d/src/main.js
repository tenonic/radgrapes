// Starts the game: builds each part from the map, then runs the game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCamera } from "./camera.js";
import { createPlayer } from "./player.js";
import { createWorld } from "./world.js";
import { createRoad } from "./road.js";
import { createWalls } from "./walls.js";
import { createObstacles } from "./obstacles.js";
import { createOrbs } from "./orbs.js";
import { createBlocks } from "./blocks.js";
import { createPortals } from "./portals.js";
import { createCeilings } from "./ceilings.js";
import { createInput } from "./input.js";
import { createMusic } from "./music.js";
import { createHud } from "./hud.js";
import { touching } from "./collision.js";
import { CRASH_PAUSE, FINISH_PAUSE } from "./config.js";
import map from "./maps/map1.js";

const { scene, renderer } = createScene();
const camera = createCamera();
const player = createPlayer(scene);
const world = createWorld(scene);
createRoad(world.group, map.length);
createWalls(world.group, map.length);
const objectsOfType = (type) => map.objects.filter((o) => o.type === type);
const obstacles = createObstacles(world.group, objectsOfType("spike"));
const orbs = createOrbs(world.group, objectsOfType("orb"));
const blocks = createBlocks(world.group, objectsOfType("block"));
const portals = createPortals(world.group, objectsOfType("portal"));
const ceilings = createCeilings(world.group, objectsOfType("portal"), map.length);
const input = createInput();
const music = createMusic();
const hud = createHud();
input.onKeyPress("KeyM", music.toggle);   // M turns the music on and off

// Keep the picture the right shape when the window is resized.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Seconds left in a pause (after a crash or a finish). 0 means the run is going.
let pauseTimeLeft = 0;

// Which try this is. Goes up by one every time the map starts over.
let attempt = 1;
hud.setAttempt(attempt);

// Start the map over from the beginning.
function restart() {
  attempt++;
  hud.setAttempt(attempt);
  hud.hideMessage();
  player.reset();
  world.reset();
  orbs.reset();
  portals.reset();
  music.start();
}

// What the player can stand on right now: the road, or the top of a raised block.
function groundHeightUnderPlayer() {
  return blocks.groundHeightUnder(player.getHitbox(), player.getBottom());
}

// What a jump press does depends on the mode:
// - cube: use an orb if touching one, otherwise a normal jump.
// - spider: teleport between the road and the ceiling.
// - ufo: a small boost up.
// - ship: nothing (it flies by holding).
function handleJump() {
  const mode = player.getMode();
  if (mode === "ufo") {
    player.flap();
    return;
  }
  if (mode === "spider") {
    player.flip(groundHeightUnderPlayer(), ceilings.isCeilingAt(world.getDistance()));
    return;
  }
  if (mode !== "cube") return;
  const orb = orbs.findTouched(player.getHitbox());
  if (orb) {
    orbs.use(orb);
    player.orbJump();
  } else {
    player.jump();
  }
}

// A crash: touching a spike, or running into the front of a raised block.
function playerCrashed() {
  const playerBox = player.getHitbox();
  return obstacles.getHitboxes().some((box) => touching(playerBox, box))
    || blocks.hitFront(playerBox);
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
    if (jumpPressed) handleJump();
    world.update(dt, map.speed);

    // Passed through a portal? Switch to its mode.
    const newMode = portals.passed(world.getDistance());
    if (newMode) player.setMode(newMode);

    player.update(
      dt,
      groundHeightUnderPlayer(),
      input.isHeld(),
      ceilings.isCeilingAt(world.getDistance())
    );

    if (playerCrashed()) {
      pauseTimeLeft = CRASH_PAUSE;
      music.stop();
    } else if (world.getDistance() >= map.length) {
      pauseTimeLeft = FINISH_PAUSE;   // made it to the finish line
      music.stop();
      hud.showMessage("Level complete!", `in ${attempt} ${attempt === 1 ? "attempt" : "attempts"}`);
    }

    hud.setProgress(world.getDistance() / map.length);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

music.start();
loop();
