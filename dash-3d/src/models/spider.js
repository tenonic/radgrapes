// The spider model: a blocky robot bug pointing down the road (the -z direction),
// with one big eye on its front face, four curved claw legs, and dark cartoon outlines.
// The eye faces forward, so it isn't seen from the camera behind.
// The legs walk: diagonal pairs swing together, like a real bug.
//
// Sizes: the feet are at y = -0.5 and the top of the body at y = 0.2 (short legs).
// To hang from the ceiling, the whole model is turned upside down.
import * as THREE from "three";
import { withOutline, toon } from "./outline.js";

const LEG_DARKEN = 0.6;          // legs are a darker shade of the body color
const EYE_COLOR = 0xf2f2f2;
const OUTLINE_COLOR = 0x111122;

const BODY_WIDTH = 0.75;
const BODY_BOTTOM = -0.3;        // the body sits this low, so the legs are short
const LEG_RADIUS = 0.07;
const LEG_OUTLINE = 0.025;       // how much thicker a leg's outline is than the leg

const STEP_SPEED = 16;           // how fast the legs swing back and forth
const STEP_SWING = 0.35;         // how far they swing (in radians, about 20 degrees)

// The body, drawn as a side view (x = forward, y = up) and stretched sideways.
// The front is a flat face (where the eye is); the back is cut at a slant.
function createBody(color) {
  const side = new THREE.Shape();
  side.moveTo(0.4, 0.5);          // front, top
  side.lineTo(0.4, 0.1);          // front, down to the cut corner
  side.lineTo(0.3, 0.0);          // front, bottom (corner cut off)
  side.lineTo(-0.05, 0.0);        // bottom
  side.lineTo(-0.45, 0.5);        // slant up to the back, top
  side.closePath();

  const geometry = new THREE.ExtrudeGeometry(side, { depth: BODY_WIDTH, bevelEnabled: false });
  geometry.rotateY(Math.PI / 2);                 // turn it so the front points down the road
  geometry.translate(-BODY_WIDTH / 2, BODY_BOTTOM, 0);   // center it left-to-right, and lower it
  return withOutline(new THREE.Mesh(geometry, toon(color)), 1.05);
}

// One big round eye on the front face, looking down the road.
function createEye() {
  const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 32);
  geometry.rotateX(Math.PI / 2);                 // face forward
  const eye = new THREE.Mesh(geometry, toon(EYE_COLOR, 0.3));
  eye.position.set(0, BODY_BOTTOM + 0.28, -0.41);
  return withOutline(eye, 1.15);
}

// A curved claw leg. It's built inside a "hip" group placed where it joins the body,
// so turning the hip swings the whole leg (that's the walking).
// hip, bend, foot: [x, y, z] points; the leg curves from hip through bend to foot.
function createLeg(hip, bend, foot, material) {
  const hipGroup = new THREE.Group();
  hipGroup.position.set(...hip);

  // The leg's points, measured from the hip.
  const relative = (p) => new THREE.Vector3(p[0] - hip[0], p[1] - hip[1], p[2] - hip[2]);
  const curve = new THREE.QuadraticBezierCurve3(relative(hip), relative(bend), relative(foot));

  hipGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, LEG_RADIUS, 10), material));

  // Outline: a slightly thicker tube showing only its inside.
  hipGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 16, LEG_RADIUS + LEG_OUTLINE, 10),
    new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide })
  ));
  return hipGroup;
}

// color: the body color (the player's blue).
// Returns the model. Call model.userData.animate(dt) every frame to make it walk.
export function createSpiderModel(color) {
  const spider = new THREE.Group();
  spider.add(createBody(color), createEye());

  const legMaterial = toon(new THREE.Color(color).multiplyScalar(LEG_DARKEN));
  const legs = [];
  for (const side of [-1, 1]) {
    // Front legs: almost straight down.
    const front = createLeg([side * 0.25, BODY_BOTTOM + 0.05, -0.2], [side * 0.33, -0.36, -0.3], [side * 0.33, -0.5, -0.27], legMaterial);
    // Back legs: curve backward like claws.
    const back = createLeg([side * 0.25, BODY_BOTTOM + 0.1, 0.15], [side * 0.36, -0.16, 0.42], [side * 0.36, -0.5, 0.38], legMaterial);
    // Diagonal pairs move together: front-left with back-right, front-right with back-left.
    legs.push({ hip: front, phase: side === -1 ? 0 : Math.PI });
    legs.push({ hip: back, phase: side === -1 ? Math.PI : 0 });
    spider.add(front, back);
  }

  let time = 0;
  spider.userData.animate = (dt) => {
    time += dt;
    for (const { hip, phase } of legs) {
      hip.rotation.x = Math.sin(time * STEP_SPEED + phase) * STEP_SWING;
    }
  };

  return spider;
}
