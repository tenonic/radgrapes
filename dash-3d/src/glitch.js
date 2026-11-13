// Glitch effect: for maps with glitch: true (Map 4). Every now and then, for a split
// second, the spikes, portals, walls, orbs and jump pads "glitch": they flicker into
// other colors, jump sideways, stretch, blink out, and the spikes get a shifted ghost
// copy (like a broken screen splitting its colors). The floor glitches too, but only
// very faintly.
//
// It only changes how things look. Hitboxes come from the spikes', orbs' and pads'
// real positions, which never move, so the glitches never cause or save a crash.
import * as THREE from "three";

// Whitish glitch colors (white with a faint tint), with little glow so they don't glare.
const GLITCH_COLORS = [0xb8c8c8, 0xc8b8c8, 0xd0d0d8, 0xb8c8bc, 0xc8c4b0];
const GLOW = 0.15;                   // how much the glitch colors light themselves
const QUIET_SECONDS = [0.25, 1.4];   // time between glitches: random, in this range
const BURST_SECONDS = [0.06, 0.25];  // how long a glitch lasts
const JUMP = 0.4;                    // how far things jump sideways, at most

const random = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// The walls' glitch glows brighter than the rest, so it stands out on the big walls.
const WALL_GLOW = [0.3, 0.6];

// The floor's glitch is much fainter than everything else's.
const FLOOR_GLOW = [0.02, 0.06];     // just a faint whitish shimmer
const FLOOR_JUMP = 0.05;             // and a tiny shake

// parent: the world group. spikes: the spike meshes. gates: [{ gate, color }] from
// portals.js. walls and road: the wall and road meshes. orbs and pads: from orbs.js
// and pads.js.
export function createGlitch(parent, { spikes, gates, walls, road, orbs, pads }) {
  // Orbs and pads: only the colors and the halo (the glow around them) glitch.
  // The core stays put, since the hitbox comes from it.
  const glowing = [...orbs.items, ...pads.items];
  // The spikes all share one material, so changing it changes every spike at once.
  const spikeMaterial = spikes[0]?.material;
  const spikeColor = spikeMaterial?.color.clone();

  // The ghost: a see-through copy of every spike, drawn in one go, shifted sideways
  // during a glitch. It's separate from the real spikes, so it has no hitbox.
  let ghost = null;
  if (spikes.length > 0) {
    ghost = new THREE.InstancedMesh(
      spikes[0].geometry,
      new THREE.MeshBasicMaterial({ color: 0xc8d0d0, transparent: true, opacity: 0.25, depthWrite: false }),
      spikes.length
    );
    spikes.forEach((spike, i) => {
      spike.updateMatrix();
      ghost.setMatrixAt(i, spike.matrix);
    });
    ghost.visible = false;
    ghost.frustumCulled = false;   // its copies are spread along the whole road
    parent.add(ghost);
  }

  // The walls' glow normally follows the road colors; remember it to put it back.
  const wallGlow = walls.map((wall) => ({ emissive: wall.material.emissive, intensity: wall.material.emissiveIntensity }));
  const glitchGlow = new THREE.Color();

  let quiet = random(...QUIET_SECONDS);   // time left until the next glitch
  let burst = 0;                          // time left in the current glitch

  // One frame of glitching: everything gets new random colors and offsets.
  function glitchFrame() {
    for (const { core, halo } of glowing) {
      core.material.color.setHex(pick(GLITCH_COLORS));
      core.material.emissive.copy(core.material.color).multiplyScalar(GLOW);
      halo.material.color.setHex(pick(GLITCH_COLORS));
      halo.position.x = random(-JUMP, JUMP);
      halo.visible = Math.random() > 0.2;          // sometimes blinks out
    }

    for (const tiles of road) {
      tiles.material.emissive.setHex(pick(GLITCH_COLORS));
      tiles.material.emissiveIntensity = random(...FLOOR_GLOW);
      tiles.position.set(random(-FLOOR_JUMP, FLOOR_JUMP), 0, 0);
    }

    if (spikeMaterial) {
      spikeMaterial.color.setHex(pick(GLITCH_COLORS));
      spikeMaterial.emissive.copy(spikeMaterial.color);
      spikeMaterial.emissiveIntensity = GLOW;
      ghost.visible = Math.random() < 0.8;
      ghost.material.color.setHex(pick(GLITCH_COLORS));
      ghost.position.set(random(-JUMP, JUMP), random(-0.15, 0.15), 0);
    }

    for (const { gate } of gates) {
      gate.material.color.setHex(pick(GLITCH_COLORS));
      gate.material.emissive.copy(gate.material.color).multiplyScalar(GLOW);
      gate.position.x = random(-JUMP, JUMP);
      gate.scale.x = random(0.6, 1.4);
      gate.visible = Math.random() > 0.2;          // sometimes blinks out
    }

    glitchGlow.setHex(pick(GLITCH_COLORS));
    for (const wall of walls) {
      wall.material.emissive = glitchGlow;
      wall.material.emissiveIntensity = random(...WALL_GLOW);
      wall.position.set(random(-JUMP / 2, JUMP / 2), random(-0.3, 0.3), 0);
    }
  }

  // Put everything back to normal.
  function restore() {
    orbs.restoreLook();
    pads.restoreLook();
    for (const tiles of road) {
      tiles.material.emissive.setHex(0x000000);
      tiles.material.emissiveIntensity = 1;
      tiles.position.set(0, 0, 0);
    }

    if (spikeMaterial) {
      spikeMaterial.color.copy(spikeColor);
      spikeMaterial.emissive.setHex(0x000000);
      spikeMaterial.emissiveIntensity = 1;
      ghost.visible = false;
    }
    for (const { gate, color } of gates) {
      gate.material.color.setHex(color);
      gate.material.emissive.setHex(color);
      gate.position.x = 0;
      gate.scale.x = 1;
      gate.visible = true;
    }
    walls.forEach((wall, i) => {
      wall.material.emissive = wallGlow[i].emissive;
      wall.material.emissiveIntensity = wallGlow[i].intensity;
      wall.position.set(0, 0, 0);
    });
  }

  function update(dt) {
    if (burst > 0) {
      burst -= dt;
      if (burst > 0) glitchFrame();
      else restore();
      return;
    }
    quiet -= dt;
    if (quiet <= 0) {
      burst = random(...BURST_SECONDS);
      quiet = random(...QUIET_SECONDS);
      glitchFrame();
    }
  }

  return { update };
}
