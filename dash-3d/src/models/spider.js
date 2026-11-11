// The spider model: the player's cube, a bit smaller, standing on six legs.
// About 1 tall (y from -0.5 at the feet to 0.5 at the top of the cube), centered on its middle.
// To hang from the ceiling, the whole model is turned upside down.
import * as THREE from "three";

const BODY_SIZE = 0.75;
const BODY_Y = 0.5 - BODY_SIZE / 2;   // top of the body at y = 0.5
const LEG_COLOR = 0x222233;
const LEG_THICKNESS = 0.06;

// One leg: a thin bar from the side of the body, out and down to the ground.
function createLeg(side, z, material) {
  const from = { x: side * BODY_SIZE / 2, y: BODY_Y - 0.15 };   // hip, on the body's side
  const to = { x: side * 0.65, y: -0.5 };                        // foot, on the ground
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const leg = new THREE.Mesh(
    new THREE.BoxGeometry(Math.hypot(dx, dy), LEG_THICKNESS, LEG_THICKNESS),
    material
  );
  leg.position.set((from.x + to.x) / 2, (from.y + to.y) / 2, z);
  leg.rotation.z = Math.atan2(dy, dx);   // tilt the bar to point from hip to foot
  return leg;
}

// bodyMaterial: the player cube's material, so the spider matches the cube.
export function createSpiderModel(bodyMaterial) {
  const spider = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(BODY_SIZE, BODY_SIZE, BODY_SIZE), bodyMaterial);
  body.position.y = BODY_Y;
  spider.add(body);

  const legMaterial = new THREE.MeshStandardMaterial({ color: LEG_COLOR });
  for (const side of [-1, 1]) {
    for (const z of [-0.25, 0, 0.25]) {
      spider.add(createLeg(side, z, legMaterial));
    }
  }

  return spider;
}
