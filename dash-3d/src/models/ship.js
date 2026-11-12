// The ship model: a cartoon rocket-ship pointing down the road (the -z direction),
// with round glowing windows, a green nose, green tail fins and dark outlines.
// A small version of the player's cube rides on top as the pilot.
//
// Sizes: about 1.65 long (z from -0.8 at the nose to 0.85 at the engine),
// and about 0.7 tall (y from -0.35 to 0.35), centered on its middle.
import * as THREE from "three";
import { withOutline, toon } from "./outline.js";

const BODY_COLOR = 0x2244dd;
const TRIM_COLOR = 0x44cc44;      // nose and fins
const WINDOW_COLOR = 0x99ff77;
const ENGINE_COLOR = 0x222233;

const BODY_FRONT_RADIUS = 0.28;
const BODY_BACK_RADIUS = 0.22;
const BODY_LENGTH = 1.0;
const BODY_Z = 0.2;               // the body runs from z = -0.3 (front) to z = 0.7 (back)
const NOSE_LENGTH = 0.5;
const RIDER_SIZE = 0.3;

// Main body: a tube, a little narrower at the back.
function createBody() {
  const geometry = new THREE.CylinderGeometry(BODY_BACK_RADIUS, BODY_FRONT_RADIUS, BODY_LENGTH, 24);
  geometry.rotateX(Math.PI / 2);   // lay it along the road; the narrow end ends up at the back
  const body = new THREE.Mesh(geometry, toon(BODY_COLOR));
  body.position.z = BODY_Z;
  return withOutline(body);
}

// Pointed green nose at the front.
function createNose() {
  const geometry = new THREE.ConeGeometry(BODY_FRONT_RADIUS, NOSE_LENGTH, 24);
  geometry.rotateX(-Math.PI / 2);  // point the tip forward
  const nose = new THREE.Mesh(geometry, toon(TRIM_COLOR));
  nose.position.z = BODY_Z - BODY_LENGTH / 2 - NOSE_LENGTH / 2;
  return withOutline(nose);
}

// Dark engine nozzle at the back.
function createEngine() {
  const geometry = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 20);
  geometry.rotateX(Math.PI / 2);
  const engine = new THREE.Mesh(geometry, toon(ENGINE_COLOR));
  engine.position.z = BODY_Z + BODY_LENGTH / 2 + 0.075;
  return engine;
}

// Three round glowing windows along each side.
function createWindows() {
  const windows = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
  geometry.rotateZ(Math.PI / 2);   // face sideways
  const material = toon(WINDOW_COLOR, 0.8);

  for (const z of [-0.15, 0.1, 0.35]) {
    // The body gets narrower toward the back, so work out its radius at this point.
    const along = (z - (BODY_Z - BODY_LENGTH / 2)) / BODY_LENGTH;   // 0 at the front, 1 at the back
    const radius = BODY_FRONT_RADIUS + (BODY_BACK_RADIUS - BODY_FRONT_RADIUS) * along;
    for (const side of [-1, 1]) {
      const pane = new THREE.Mesh(geometry, material);
      pane.position.set(side * radius, 0.02, z);
      windows.add(pane);
    }
  }
  return windows;
}

// Four green fins around the back, in an X shape.
function createFins() {
  const fins = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.05, 0.22, 0.32);
  const material = toon(TRIM_COLOR);

  for (const angle of [45, 135, 225, 315]) {
    const a = THREE.MathUtils.degToRad(angle);
    const fin = new THREE.Mesh(geometry, material);
    const r = BODY_BACK_RADIUS + 0.1;
    fin.position.set(Math.cos(a) * r, Math.sin(a) * r, BODY_Z + BODY_LENGTH / 2 - 0.15);
    fin.rotation.z = a - Math.PI / 2;   // stand the fin out from the body
    fins.add(withOutline(fin));
  }
  return fins;
}

// riderMaterial: the player cube's material, so the pilot matches the cube.
export function createShipModel(riderMaterial) {
  const ship = new THREE.Group();
  ship.add(createBody(), createNose(), createEngine(), createWindows(), createFins());

  const rider = new THREE.Mesh(new THREE.BoxGeometry(RIDER_SIZE, RIDER_SIZE, RIDER_SIZE), riderMaterial);
  rider.position.set(0, BODY_FRONT_RADIUS - 0.05, 0.1);   // sitting in the top, partly sunk in
  ship.add(rider);

  return ship;
}
