// Jump orbs: glowing yellow spheres floating above the road.
// Pressing jump while touching an orb gives a fresh jump, even in mid-air.
// Each orb works once per run; a used orb goes dim.
//
// An orb is two spheres: a bright pale-yellow core, and a bigger see-through golden
// "halo" around it that gently pulses, so it looks like it's glowing.
import * as THREE from "three";
import { getHitbox, touching } from "./collision.js";

const CORE_RADIUS = 0.35;
const HALO_RADIUS = 0.55;
const CORE_COLOR = 0xfff27a;     // pale, bright yellow
const HALO_COLOR = 0xffc400;     // deep golden yellow
const USED_CORE_COLOR = 0x6b6430;
const HALO_OPACITY = 0.35;
const PULSE_SPEED = 5;           // how fast the halo pulses
const PULSE_SIZE = 0.12;         // how much the halo grows and shrinks (12%)
const HITBOX_GROW = 0.3;         // the hitbox is bigger than the core, so orbs are easy to catch

function createOrb() {
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_RADIUS, 24, 16),
    new THREE.MeshStandardMaterial({ color: CORE_COLOR, emissive: CORE_COLOR, emissiveIntensity: 1 })
  );

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(HALO_RADIUS, 24, 16),
    new THREE.MeshBasicMaterial({
      color: HALO_COLOR,
      transparent: true,
      opacity: HALO_OPACITY,
      blending: THREE.AdditiveBlending,   // adds light on top of what's behind it, like a glow
      depthWrite: false
    })
  );

  const group = new THREE.Group();
  group.add(core, halo);
  return { group, core, halo };
}

export function createOrbs(parent, list) {
  const orbs = list.map(({ at, height }) => {
    const orb = createOrb();
    orb.group.position.set(0, height, -at);
    parent.add(orb.group);
    return { ...orb, used: false };
  });

  let time = 0;

  function setUsed(orb, used) {
    orb.used = used;
    const color = used ? USED_CORE_COLOR : CORE_COLOR;
    orb.core.material.color.setHex(color);
    orb.core.material.emissive.setHex(color);
    orb.halo.visible = !used;   // a used orb stops glowing
  }

  // Make the halos pulse.
  function update(dt) {
    time += dt;
    const scale = 1 + Math.sin(time * PULSE_SPEED) * PULSE_SIZE;
    for (const orb of orbs) orb.halo.scale.setScalar(scale);
  }

  // Returns an unused orb the player is touching, or null if there isn't one.
  // Only the core counts (plus a margin), so the pulsing halo doesn't change the hitbox.
  function findTouched(playerBox) {
    return orbs.find((orb) =>
      !orb.used && touching(playerBox, getHitbox(orb.core, -HITBOX_GROW))
    ) ?? null;
  }

  function use(orb) {
    setUsed(orb, true);
  }

  // Make every orb usable again (when the run restarts).
  function reset() {
    orbs.forEach((orb) => setUsed(orb, false));
  }

  return { update, findTouched, use, reset };
}
