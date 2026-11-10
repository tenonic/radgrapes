// Jump orbs: glowing rings floating above the road.
// Pressing jump while touching an orb gives a fresh jump, even in mid-air.
// Each orb works once per run; a used orb goes dim.
import * as THREE from "three";
import { getHitbox, touching } from "./collision.js";

const RING_RADIUS = 0.4;
const RING_THICKNESS = 0.08;
const HITBOX_GROW = 0.3;   // the orb's hitbox is bigger than the ring, so it's easy to catch
const COLOR = 0xffdd33;
const USED_COLOR = 0x665a22;

function createRing() {
  const geometry = new THREE.TorusGeometry(RING_RADIUS, RING_THICKNESS, 12, 32);
  const material = new THREE.MeshStandardMaterial({
    color: COLOR,
    emissive: COLOR,          // makes it glow, so it stands out from the road
    emissiveIntensity: 0.6
  });
  return new THREE.Mesh(geometry, material);   // the ring faces the player
}

export function createOrbs(parent, list) {
  const orbs = list.map(({ at, height }) => {
    const mesh = createRing();
    mesh.position.set(0, height, -at);
    parent.add(mesh);
    return { mesh, used: false };
  });

  function setUsed(orb, used) {
    orb.used = used;
    const color = used ? USED_COLOR : COLOR;
    orb.mesh.material.color.setHex(color);
    orb.mesh.material.emissive.setHex(color);
  }

  // Returns an unused orb the player is touching, or null if there isn't one.
  function findTouched(playerBox) {
    return orbs.find((orb) =>
      !orb.used && touching(playerBox, getHitbox(orb.mesh, -HITBOX_GROW))
    ) ?? null;
  }

  function use(orb) {
    setUsed(orb, true);
  }

  // Make every orb usable again (when the run restarts).
  function reset() {
    orbs.forEach((orb) => setUsed(orb, false));
  }

  return { findTouched, use, reset };
}
