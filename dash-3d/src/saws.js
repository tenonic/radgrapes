// Saws: spinning sawblades. Touching one is a crash, like a spike.
// Listed in the map as { type: "saw", at, height, radius }:
//   at: where it is along the road. height: where its center is (0 = half-buried in
//   the road, so only the top half shows). radius: how big it is (default 1).
//
// The blade faces the camera, so you see the whole spinning circle.
// The hitbox is a square a little smaller than the blade, so only clear hits count,
// and it's worked out from the saw's position, so the spinning doesn't change it.
import * as THREE from "three";

const TEETH = 14;
const THICKNESS = 0.15;
const SPIN_SPEED = 9;            // radians per second
const HITBOX_SIZE = 0.8;         // the hitbox's half-size, as a part of the radius
const HITBOX_DEPTH = 0.2;        // half its thickness along the road
const CHECK_DISTANCE = 4;        // only saws this close (along the road) are checked for hits

const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.8, roughness: 0.3 });
const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xff2255, emissive: 0xff2255, emissiveIntensity: 0.6 });

// One shape per size, shared by every saw of that size: a flat star with sharp teeth.
const bladeShapes = new Map();
function bladeGeometry(radius) {
  if (!bladeShapes.has(radius)) {
    const shape = new THREE.Shape();
    for (let i = 0; i < TEETH * 2; i++) {
      const angle = (i / (TEETH * 2)) * Math.PI * 2;
      // Teeth: every other point sticks out, and leans forward a bit so they look sharp.
      const r = i % 2 === 0 ? radius : radius * 0.78;
      const lean = i % 2 === 0 ? 0.12 : 0;
      const x = Math.cos(angle + lean) * r;
      const y = Math.sin(angle + lean) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: THICKNESS, bevelEnabled: false });
    geometry.translate(0, 0, -THICKNESS / 2);
    bladeShapes.set(radius, geometry);
  }
  return bladeShapes.get(radius);
}

const hubGeometry = new THREE.CylinderGeometry(1, 1, THICKNESS * 2, 16).rotateX(Math.PI / 2);

export function createSaws(parent, list) {
  const saws = list.map(({ at, height = 0, radius = 1 }) => {
    const blade = new THREE.Mesh(bladeGeometry(radius), bladeMaterial);
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.scale.set(radius * 0.25, radius * 0.25, 1);
    blade.add(hub);
    blade.position.set(0, height, -at);
    parent.add(blade);
    return { at, height, radius, blade };
  });

  // Spin every saw.
  function update(dt) {
    for (const saw of saws) saw.blade.rotation.z -= SPIN_SPEED * dt;
  }

  // The hitboxes of the saws near the player. distance: how far along the road the
  // player is. The saw's place along the road moves with the world, so it's
  // worked out from the world's movement (the blade's position in the world).
  function getHitboxes(distance) {
    return saws
      .filter(({ at }) => Math.abs(at - distance) < CHECK_DISTANCE)
      .map(({ blade, radius }) => {
        const center = blade.getWorldPosition(new THREE.Vector3());
        const half = new THREE.Vector3(radius * HITBOX_SIZE, radius * HITBOX_SIZE, HITBOX_DEPTH);
        return new THREE.Box3(center.clone().sub(half), center.clone().add(half));
      });
  }

  return { update, getHitboxes };
}
