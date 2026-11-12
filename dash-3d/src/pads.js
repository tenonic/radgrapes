// Jump pads: glowing yellow plates on the road (or on top of a raised block).
// Running over one launches the cube much higher than a normal jump, with no press needed.
// Each pad works once per run and goes dim when used.
import * as THREE from "three";
import { getHitbox, touching } from "./collision.js";

const WIDTH = 1.4;
const THICKNESS = 0.12;
const DEPTH = 0.9;
const HITBOX_GROW = 0.1;
const COLOR = 0xffee33;
const USED_COLOR = 0x6b6420;

export function createPads(parent, list) {
  const pads = list.map(({ at, height = 0 }) => {
    const material = new THREE.MeshStandardMaterial({ color: COLOR, emissive: COLOR, emissiveIntensity: 0.7 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, THICKNESS, DEPTH), material);
    mesh.position.set(0, height + THICKNESS / 2, -at);
    parent.add(mesh);
    return { mesh, used: false };
  });

  function setUsed(pad, used) {
    pad.used = used;
    const color = used ? USED_COLOR : COLOR;
    pad.mesh.material.color.setHex(color);
    pad.mesh.material.emissive.setHex(color);
  }

  // Returns an unused pad the player is touching, or null.
  function findTouched(playerBox) {
    return pads.find((pad) =>
      !pad.used && touching(playerBox, getHitbox(pad.mesh, -HITBOX_GROW))
    ) ?? null;
  }

  function use(pad) {
    setUsed(pad, true);
  }

  // Make every pad usable again (when the run restarts).
  function reset() {
    pads.forEach((pad) => setUsed(pad, false));
  }

  return { findTouched, use, reset };
}
