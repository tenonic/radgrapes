// The player. It stays in place front-to-back (the road moves toward it instead).
// It has three modes, switched by portals:
// - "cube": jumps, lands on raised blocks, falls back down.
// - "ship": flies up while jump is held, drifts down when it's let go.
// - "spider": a jump press teleports it between the road and the ceiling.
// - "ufo": every jump press gives a small boost up, even in mid-air.
import * as THREE from "three";
import { createShipModel } from "./models/ship.js";
import { createSpiderModel } from "./models/spider.js";
import { createUfoModel } from "./models/ufo.js";
import { CEILING_HEIGHT } from "./config.js";

export const PLAYER_COLOR = 0x33ccff;
const COLOR = PLAYER_COLOR;
const CUBE_OPACITY = 0.6;    // 1 = solid, 0 = invisible

// Cube settings. At the normal speed (10), a jump clears at most 3 spikes in a row, never 4.
// The jump is as long as it can be without clearing 4, so triples have a fair timing
// window (about 85 ms). Going above 11.65 lets 4 spikes through.
// The cube goes about 1.68 units high and stays in the air for about 0.58 seconds.
const CUBE_SIZE = 1;
const JUMP_SPEED = 11.6;     // upward speed at the start of a jump (units per second)
const GRAVITY = 40;          // how fast upward speed drains away (units per second, per second)
const PAD_SPEED = 15;        // jump pads launch the cube this fast: about 2.8 units high
// While in the air, the cube spins forward. A normal jump (about 0.58 s) is exactly a half turn.
const AIR_TIME = (2 * JUMP_SPEED) / GRAVITY;
const SPIN_SPEED = Math.PI / AIR_TIME;   // radians per second
const QUARTER_TURN = Math.PI / 2;

// Ship settings.
const SHIP_THRUST = 30;      // upward pull while jump is held
const SHIP_GRAVITY = 30;     // downward pull while it's not
const SHIP_MAX_SPEED = 8;    // fastest it can move up or down
const SHIP_TILT = 0.06;      // how much the nose tips up or down with the speed (just for looks)

// UFO settings. Each boost lifts it about 0.8 units, so climbing takes several taps.
const UFO_BOOST = 7;         // upward speed right after a tap
const UFO_GRAVITY = 30;      // how fast it falls between taps
const UFO_MAX_FALL = 10;     // fastest it can fall

// Hitbox half-sizes for each mode (a little smaller than the model, so hits are fair).
const HALF_SIZE = {
  cube: { x: 0.45, y: 0.45, z: 0.45 },
  ship: { x: 0.4, y: 0.3, z: 0.75 },
  spider: { x: 0.45, y: 0.45, z: 0.45 },
  ufo: { x: 0.6, y: 0.42, z: 0.6 }
};
// Half-height of the model, used to place its bottom (or top) exactly on a surface.
const HALF_HEIGHT = { cube: CUBE_SIZE / 2, ship: 0.35, spider: 0.5, ufo: 0.5 };

// The cube is semi-transparent, so you can see the road through it.
function createCubeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: COLOR,
    transparent: true,
    opacity: CUBE_OPACITY
  });
}

function createCubeModel() {
  return new THREE.Mesh(new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE), createCubeMaterial());
}

export function createPlayer(scene) {
  const models = {
    cube: createCubeModel(),
    ship: createShipModel(createCubeMaterial()),
    spider: createSpiderModel(COLOR),
    ufo: createUfoModel(COLOR, createCubeMaterial())
  };

  // "body" is what moves up and down; it holds every model and shows one at a time.
  const body = new THREE.Group();
  body.add(...Object.values(models));
  scene.add(body);

  let mode = "cube";
  let velocityY = 0;       // current up/down speed: positive = rising, negative = falling
  let onGround = true;     // standing on the road, a block, or (spider) the ceiling
  let onCeiling = false;   // spider only: hanging upside down from the ceiling

  // Height of the bottom of the player above the road.
  function getBottom() {
    return body.position.y - HALF_HEIGHT[mode];
  }

  function setBottom(height) {
    body.position.y = height + HALF_HEIGHT[mode];
  }

  function setOnCeiling(value) {
    onCeiling = value;
    models.spider.rotation.z = value ? Math.PI : 0;   // upside down on the ceiling
  }

  // Switch to "cube", "ship" or "spider". The bottom stays at the same height.
  function setMode(newMode) {
    const bottom = getBottom();
    mode = newMode;
    setBottom(bottom);
    velocityY = 0;
    onGround = false;      // let the next update decide if it's standing on something
    setOnCeiling(false);
    for (const [name, model] of Object.entries(models)) model.visible = name === mode;
    models.ship.rotation.x = 0;
    models.cube.rotation.x = 0;
  }

  function launch() {
    velocityY = JUMP_SPEED;
    onGround = false;
  }

  // A normal jump: only the cube, only from the ground (no jumping in mid-air).
  function jump() {
    if (mode === "cube" && onGround) launch();
  }

  // A launch from a jump pad: much higher than a normal jump. Only the cube uses pads.
  function padJump() {
    if (mode !== "cube") return;
    velocityY = PAD_SPEED;
    onGround = false;
  }

  // Show or hide the player (it's hidden while its pieces fly apart after a crash).
  function setVisible(visible) {
    body.visible = visible;
  }

  // A jump from an orb: works anywhere, even in mid-air.
  function orbJump() {
    if (mode === "cube") launch();
  }

  // UFO: a small boost up. Works any time, even in mid-air.
  function flap() {
    if (mode === "ufo") velocityY = UFO_BOOST;
  }

  // Spider: teleport to the opposite surface. Only works while touching a surface.
  // groundHeight: where it lands when going down. hasCeiling: is there a ceiling to go up to.
  function flip(groundHeight, hasCeiling) {
    if (mode !== "spider" || !onGround) return;
    if (onCeiling) {
      setOnCeiling(false);
      setBottom(groundHeight);
    } else if (hasCeiling) {
      setOnCeiling(true);
      body.position.y = CEILING_HEIGHT - HALF_HEIGHT.spider;   // top touches the ceiling
    }
    velocityY = 0;
  }

  // Falling: gravity pulls the speed down every frame, so the player rises, slows,
  // stops at the top, then falls faster and faster until it lands.
  // Used by the cube, and by the spider while it's right side up.
  function updateFalling(dt, groundHeight) {
    if (onGround) {
      if (getBottom() > groundHeight) {
        // Ran off the end of a raised block: start falling.
        onGround = false;
        velocityY = 0;
      } else {
        setBottom(groundHeight);   // stay on top (or step up a tiny bit)
        return;
      }
    }

    velocityY -= GRAVITY * dt;
    body.position.y += velocityY * dt;

    if (velocityY <= 0 && getBottom() <= groundHeight) {   // landed
      setBottom(groundHeight);
      velocityY = 0;
      onGround = true;
    }
  }

  // Ship: holding jump pulls it up, letting go lets it drift down.
  // It slides along the ground and stops at the ceiling.
  function updateShip(dt, groundHeight, holding) {
    velocityY += (holding ? SHIP_THRUST : -SHIP_GRAVITY) * dt;
    velocityY = THREE.MathUtils.clamp(velocityY, -SHIP_MAX_SPEED, SHIP_MAX_SPEED);
    body.position.y += velocityY * dt;

    if (getBottom() <= groundHeight) {
      setBottom(groundHeight);
      velocityY = Math.max(velocityY, 0);
    }
    const top = body.position.y + HALF_HEIGHT.ship;
    if (top >= CEILING_HEIGHT) {
      body.position.y = CEILING_HEIGHT - HALF_HEIGHT.ship;
      velocityY = Math.min(velocityY, 0);
    }

    models.ship.rotation.x = velocityY * SHIP_TILT;
  }

  // Spider: on the ceiling it stays put (if the ceiling ends, it drops).
  // Right side up, it falls and lands like the cube, but never jumps.
  function updateSpider(dt, groundHeight, hasCeiling) {
    if (onGround) models.spider.userData.animate(dt);   // legs walk only while touching a surface

    if (onCeiling) {
      if (hasCeiling) return;
      setOnCeiling(false);
      onGround = false;
      velocityY = 0;
    }
    updateFalling(dt, groundHeight);
  }

  // UFO: gravity pulls it down between taps. It rests on the ground and stops at the ceiling.
  function updateUfo(dt, groundHeight) {
    velocityY = Math.max(velocityY - UFO_GRAVITY * dt, -UFO_MAX_FALL);
    body.position.y += velocityY * dt;

    if (getBottom() <= groundHeight) {
      setBottom(groundHeight);
      velocityY = Math.max(velocityY, 0);
    }
    const top = body.position.y + HALF_HEIGHT.ufo;
    if (top >= CEILING_HEIGHT) {
      body.position.y = CEILING_HEIGHT - HALF_HEIGHT.ufo;
      velocityY = Math.min(velocityY, 0);
    }
  }

  // groundHeight: what the player can stand on right now (0 = road, higher = a raised block).
  // holding: is jump held down (only the ship uses this).
  // hasCeiling: is there a ceiling overhead (only the spider uses this).
  // Cube: spin forward while in the air; on landing, snap to the nearest flat side.
  // (Forward is -z, so the spin is a negative turn around the x axis.)
  function updateCube(dt, groundHeight) {
    updateFalling(dt, groundHeight);
    const cube = models.cube;
    if (onGround) cube.rotation.x = Math.round(cube.rotation.x / QUARTER_TURN) * QUARTER_TURN % (2 * Math.PI);
    else cube.rotation.x -= SPIN_SPEED * dt;
  }

  function update(dt, groundHeight, holding, hasCeiling) {
    if (mode === "cube") updateCube(dt, groundHeight);
    else if (mode === "ship") updateShip(dt, groundHeight, holding);
    else if (mode === "spider") updateSpider(dt, groundHeight, hasCeiling);
    else updateUfo(dt, groundHeight);
  }

  // Back to a cube on the road, standing still.
  function reset() {
    setVisible(true);
    setMode("cube");
    setBottom(0);
    onGround = true;
  }

  // The hitbox is worked out from the position, not the model, so hidden
  // models and the ship's tilt don't change it.
  function getHitbox() {
    const half = HALF_SIZE[mode];
    const center = body.position;
    return new THREE.Box3(
      new THREE.Vector3(center.x - half.x, center.y - half.y, center.z - half.z),
      new THREE.Vector3(center.x + half.x, center.y + half.y, center.z + half.z)
    );
  }

  function getMode() {
    return mode;
  }

  reset();
  return { jump, padJump, orbJump, flip, flap, setVisible, setMode, getMode, update, reset, getBottom, getHitbox };
}
