// Starts the game: builds each part from the map, then runs the game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createCamera } from "./camera.js";
import { createPlayer, PLAYER_COLOR } from "./player.js";
import { createWorld } from "./world.js";
import { createRoad } from "./road.js";
import { createWalls } from "./walls.js";
import { createObstacles } from "./obstacles.js";
import { createOrbs } from "./orbs.js";
import { createPads } from "./pads.js";
import { createBlocks } from "./blocks.js";
import { createSaws } from "./saws.js";
import { createPortals } from "./portals.js";
import { createCeilings } from "./ceilings.js";
import { createInput } from "./input.js";
import { createMusic } from "./music.js";
import { playCrash } from "./sounds.js";
import { createEffects } from "./effects.js";
import { createHud } from "./hud.js";
import { createMenu } from "./menu.js";
import { createThemes } from "./themes.js";
import { createLights } from "./lights.js";
import { createGlitch } from "./glitch.js";
import { createBackground } from "./background.js";
import { loadBest, saveBest } from "./save.js";
import { touching } from "./collision.js";
import { CRASH_PAUSE, FINISH_PAUSE } from "./config.js";
import { LEVELS } from "./maps/levels.js";

// Show the level selection screen and wait for a level to be picked.
const menu = createMenu(LEVELS);
const level = await menu.pickLevel();
const map = { ...(await level.load()).default, name: level.name };

const { scene, renderer, lights: sceneLights } = createScene();
const camera = createCamera();
const player = createPlayer(scene);
const world = createWorld(scene);
const road = createRoad(world.group, map.length, { grid: map.grid });
// Side walls, unless the map turns them off (Void Sovereign floats in open space).
const walls = map.walls === false ? [] : createWalls(world.group, map.length, { grid: map.grid });
const objectsOfType = (type) => map.objects.filter((o) => o.type === type);
const obstacles = createObstacles(world.group, objectsOfType("spike"));
const orbs = createOrbs(world.group, objectsOfType("orb"));
const pads = createPads(world.group, objectsOfType("pad"));
const blocks = createBlocks(world.group, objectsOfType("block"));
const saws = createSaws(world.group, objectsOfType("saw"));
const portals = createPortals(world.group, objectsOfType("portal"));
const ceilings = createCeilings(world.group, objectsOfType("portal"), map.length);
const themes = createThemes(map.theme, objectsOfType("colors"));
// Dim, flashing lights, only on maps that ask for them (Map 4).
const lights = map.lights === "flashing" ? createLights(sceneLights, map.song) : null;
// Glitchy spikes, portals and walls, only on maps that ask for them (Map 4).
const glitch = map.glitch
  ? createGlitch(world.group, { spikes: obstacles.meshes, gates: portals.gates, walls, road, orbs, pads })
  : null;
const effects = createEffects(scene, camera);
// A special background, only on maps that ask for one (Void Sovereign).
const background = map.background ? createBackground(scene, map.background) : null;
const input = createInput();
const music = createMusic(map.song);
const hud = createHud();
input.onKeyPress("KeyM", music.toggle);   // M turns the music on and off
input.onKeyPress("Escape", () => location.reload());   // Esc goes back to the level selection screen

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

// Best progress on this map, in percent. Saved, so it's remembered next time.
let best = loadBest(map.name);
hud.setBest(best);

// How far along the map the player is, in percent (0 to 100).
function currentPercent() {
  return Math.min(Math.floor((world.getDistance() / map.length) * 100), 100);
}

function updateBest(percent) {
  if (percent <= best) return;
  best = percent;
  saveBest(map.name, best);
  hud.setBest(best);
}

// Start the map over from the beginning.
function restart() {
  attempt++;
  hud.setAttempt(attempt);
  hud.hideMessage();
  effects.clear();
  player.reset();
  world.reset();
  orbs.reset();
  pads.reset();
  portals.reset();
  themes.update(0);
  lights?.update(0);
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

// Running over a jump pad launches the cube.
function checkPads() {
  if (player.getMode() !== "cube") return;
  const pad = pads.findTouched(player.getHitbox());
  if (pad) {
    pads.use(pad);
    player.padJump();
  }
}

// A crash: touching a spike or a saw, or running into the front of a raised block.
function playerCrashed() {
  const playerBox = player.getHitbox();
  return obstacles.getHitboxes(world.getDistance()).some((box) => touching(playerBox, box))
    || saws.getHitboxes(world.getDistance()).some((box) => touching(playerBox, box))
    || blocks.hitFront(playerBox);
}

function crash() {
  pauseTimeLeft = CRASH_PAUSE;
  music.stop();
  playCrash();
  effects.crash(player.getHitbox().getCenter(new THREE.Vector3()), PLAYER_COLOR);
  player.setVisible(false);
  updateBest(currentPercent());
}

function finish() {
  pauseTimeLeft = FINISH_PAUSE;
  music.stop();
  updateBest(100);
  hud.showMessage("Level complete!", `in ${attempt} ${attempt === 1 ? "attempt" : "attempts"}`);
}

// One frame of the run: move everything, then check for crashes and the finish.
function updateRun(dt, jumpPressed) {
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
  checkPads();

  if (playerCrashed()) crash();
  else if (world.getDistance() >= map.length) finish();

  hud.setProgress(world.getDistance() / map.length);
  themes.update(world.getDistance());
  lights?.update(world.getDistance() / map.speed);   // after the themes: it dims the sky they set
}

// The game loop: runs about 60 times per second.
// dt is the time since the last frame, so the speed is the same on fast and slow computers.
const clock = new THREE.Clock();

function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);  // cap it, so a slow frame doesn't cause a big jump
  const jumpPressed = input.consumeJump();     // read every frame, so presses during a pause are thrown away

  if (pauseTimeLeft > 0) {
    // Paused after a crash or finish: wait, then restart.
    pauseTimeLeft -= dt;
    if (pauseTimeLeft <= 0) {
      pauseTimeLeft = 0;
      restart();
    }
  } else {
    updateRun(dt, jumpPressed);
  }

  effects.update(dt);
  glitch?.update(dt);
  background?.update(dt);
  orbs.update(dt);   // the orbs' and pads' glow pulses all the time, even during pauses
  saws.update(dt);   // the saws spin all the time too
  pads.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

music.start();   // the level was picked with a click or key press, so sound is allowed
loop();
