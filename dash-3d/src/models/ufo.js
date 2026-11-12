// The UFO model: a flying saucer with a tall glass dome, and the player's cube inside as the pilot.
// From top to bottom: glass dome, stepped top deck, wide rim with sloped edges,
// rounded lower bowl, and a small foot underneath. Dark cartoon outlines.
//
// The round parts are made by "lathing": drawing half of the side view as a line
// of points, then spinning it all the way around, like a pot on a potter's wheel.
//
// Sizes: about 1.3 wide and 1 tall (y from -0.5 to 0.5), centered on its middle.
import * as THREE from "three";
import { withOutline, toon } from "./outline.js";

const BOWL_DARKEN = 0.65;      // the lower bowl is a darker shade of the body color
const FOOT_COLOR = 0x1a3a4a;
const GLASS_COLOR = 0xdff6ff;
const GLASS_OPACITY = 0.25;
const RIDER_SIZE = 0.35;

const DECK_Y = 0.17;           // height of the top deck, where the dome and the pilot sit
const DOME_RADIUS = 0.42;
const DOME_WALL = 0.12;        // straight glass wall below the round top of the dome
const OFFSET_Y = -0.21;        // shifts the whole model so it's centered on its middle

// Turns a list of [radius, height] points into a round shape by spinning it.
function lathe(points, material) {
  const geometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 48);
  return withOutline(new THREE.Mesh(geometry, material), 1.04);
}

// The top half of the saucer: the sloped rim and the stepped top deck.
function createTop(color) {
  return lathe([
    [0, 0],                    // center, at the rim line
    [0.65, 0],                 // rim edge
    [0.55, 0.1],               // sloped edge going up
    [0.45, 0.12],              // top deck
    [0.4, DECK_Y],             // step up
    [0, DECK_Y]                // center of the deck
  ], toon(color));
}

// The lower bowl: curves out from the bottom up to the rim.
// (Points go from bottom to top, so the outside of the shape faces outward.)
function createBowl(color) {
  const darker = new THREE.Color(color).multiplyScalar(BOWL_DARKEN);
  return lathe([
    [0, -0.2],                 // center of the bottom
    [0.3, -0.2],
    [0.48, -0.16],
    [0.57, -0.08],
    [0.6, 0],                  // up to the rim line
    [0, 0]
  ], toon(darker));
}

// The small foot underneath.
function createFoot() {
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.08, 32), toon(FOOT_COLOR));
  foot.position.y = -0.24;
  return withOutline(foot, 1.06);
}

// The tall see-through dome: a short straight wall with a half-ball on top.
function createDome() {
  const glass = new THREE.MeshStandardMaterial({
    color: GLASS_COLOR,
    transparent: true,
    opacity: GLASS_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false          // so the pilot inside still shows through the glass
  });
  const dome = new THREE.Group();

  const wall = new THREE.Mesh(new THREE.CylinderGeometry(DOME_RADIUS, DOME_RADIUS, DOME_WALL, 48, 1, true), glass);
  wall.position.y = DECK_Y + DOME_WALL / 2;
  dome.add(wall);

  const top = new THREE.Mesh(
    new THREE.SphereGeometry(DOME_RADIUS, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glass
  );
  top.position.y = DECK_Y + DOME_WALL;
  dome.add(top);

  return dome;
}

// color: the body color (the player's blue).
// riderMaterial: the player cube's material, so the pilot matches the cube.
export function createUfoModel(color, riderMaterial) {
  const parts = new THREE.Group();
  parts.add(createTop(color), createBowl(color), createFoot());

  const rider = new THREE.Mesh(new THREE.BoxGeometry(RIDER_SIZE, RIDER_SIZE, RIDER_SIZE), riderMaterial);
  rider.position.y = DECK_Y + RIDER_SIZE / 2;   // sitting on the deck, inside the dome
  parts.add(rider);

  parts.add(createDome());   // added last so the glass is drawn over the pilot
  parts.position.y = OFFSET_Y;

  const ufo = new THREE.Group();
  ufo.add(parts);
  return ufo;
}
