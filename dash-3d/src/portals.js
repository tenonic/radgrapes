// Portals: tall glowing gates on the road. Passing through one changes the
// player's mode ("cube", "ship", "spider" or "ufo").
import * as THREE from "three";

const COLORS = { cube: 0x55ff88, ship: 0xff55cc, spider: 0xaa66ff, ufo: 0xffaa33 };

// An upright oval ring, standing on the road.
function createGate(mode) {
  const geometry = new THREE.TorusGeometry(1.2, 0.12, 12, 40);
  const material = new THREE.MeshStandardMaterial({
    color: COLORS[mode],
    emissive: COLORS[mode],   // glow, so it stands out
    emissiveIntensity: 0.7
  });
  const gate = new THREE.Mesh(geometry, material);
  gate.scale.y = 1.5;          // stretch it into a tall oval
  gate.position.y = 1.8;       // bottom of the oval just above the road
  return gate;
}

export function createPortals(parent, list) {
  // Sorted front to back, so we only ever need to watch the next one.
  const portals = [...list].sort((a, b) => a.at - b.at);

  for (const { at, mode } of portals) {
    const gate = createGate(mode);
    gate.position.z = -at;
    parent.add(gate);
  }

  let next = 0;   // index of the next portal the player hasn't passed yet

  // Returns the mode of a portal the player passed since last frame, or null.
  // distance: how far along the road the player is.
  function passed(distance) {
    let mode = null;
    while (next < portals.length && distance >= portals[next].at) {
      mode = portals[next].mode;
      next++;
    }
    return mode;
  }

  function reset() {
    next = 0;
  }

  return { passed, reset };
}
