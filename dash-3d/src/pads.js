// Jump pads: glowing yellow domes on the road (or on top of a raised block).
// Running over one launches the cube much higher than a normal jump, with no press needed.
// Each pad works once per run and goes dim when used.
//
// Like the orbs, a pad is a bright pale-yellow core with a see-through golden "halo"
// that gently pulses, so it looks like it's glowing. Here both are flat half-domes.
import * as THREE from "three";
import { getHitbox, touching } from "./collision.js";

const CORE_RADIUS = 0.6;
const CORE_FLATNESS = 0.25;      // squashes a half-ball into a low dome
const HALO_RADIUS = 0.8;
const HALO_FLATNESS = 0.4;
const CORE_COLOR = 0xfff27a;     // pale, bright yellow (same as the orbs)
const HALO_COLOR = 0xffc400;     // deep golden yellow (same as the orbs)
const USED_CORE_COLOR = 0x6b6430;
const HALO_OPACITY = 0.35;
const PULSE_SPEED = 5;
const PULSE_SIZE = 0.12;
const HITBOX_GROW = 0.1;

// The top half of a ball, squashed flat.
function dome(radius, flatness, material) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    material
  );
  mesh.scale.y = flatness;
  return mesh;
}

function createPad() {
  const core = dome(CORE_RADIUS, CORE_FLATNESS,
    new THREE.MeshStandardMaterial({ color: CORE_COLOR, emissive: CORE_COLOR, emissiveIntensity: 1 }));

  const halo = dome(HALO_RADIUS, HALO_FLATNESS,
    new THREE.MeshBasicMaterial({
      color: HALO_COLOR,
      transparent: true,
      opacity: HALO_OPACITY,
      blending: THREE.AdditiveBlending,   // adds light on top of what's behind it, like a glow
      depthWrite: false
    }));

  const group = new THREE.Group();
  group.add(core, halo);
  return { group, core, halo };
}

export function createPads(parent, list) {
  const pads = list.map(({ at, height = 0 }) => {
    const pad = createPad();
    pad.group.position.set(0, height, -at);   // the dome sits on the road (or block top)
    parent.add(pad.group);
    return { ...pad, used: false };
  });

  let time = 0;

  function setUsed(pad, used) {
    pad.used = used;
    const color = used ? USED_CORE_COLOR : CORE_COLOR;
    pad.core.material.color.setHex(color);
    pad.core.material.emissive.setHex(color);
    pad.halo.visible = !used;   // a used pad stops glowing
  }

  // Make the halos pulse. Only the halo's width changes, so it doesn't sink into the road.
  function update(dt) {
    time += dt;
    const scale = 1 + Math.sin(time * PULSE_SPEED) * PULSE_SIZE;
    for (const pad of pads) pad.halo.scale.set(scale, HALO_FLATNESS * scale, scale);
  }

  // Returns an unused pad the player is touching, or null.
  // Only the core counts (plus a margin), so the pulsing halo doesn't change the hitbox.
  function findTouched(playerBox) {
    return pads.find((pad) =>
      !pad.used && touching(playerBox, getHitbox(pad.core, -HITBOX_GROW))
    ) ?? null;
  }

  function use(pad) {
    setUsed(pad, true);
  }

  // Make every pad usable again (when the run restarts).
  function reset() {
    pads.forEach((pad) => setUsed(pad, false));
  }

  // Put every pad's normal look back (after the glitch effect has changed it).
  function restoreLook() {
    for (const pad of pads) {
      setUsed(pad, pad.used);
      pad.halo.material.color.setHex(HALO_COLOR);
      pad.halo.position.set(0, 0, 0);
    }
  }

  return { update, findTouched, use, reset, restoreLook, items: pads };
}
