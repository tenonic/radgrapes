// Obstacles: built from the map's obstacle list and placed along the road.
// They sit still in the world; the world moves, so they come toward the player.
//
// A long map has over a thousand spikes, so:
// - they all share one shape and one material (cheaper to draw), and
// - only spikes near the player are checked for hits.
import * as THREE from "three";
import { getHitbox } from "./collision.js";
import { CEILING_HEIGHT } from "./config.js";

const SPIKE_HEIGHT = 1;
const SPIKE_HITBOX_SHRINK = 0.15;
const CHECK_DISTANCE = 3;   // only spikes this close (along the road) are checked for hits

// A spike is a 4-sided cone: a pyramid.
// Turn the shape itself (not the object) so a flat side faces the player.
// Turning the shape keeps the hitbox the same size as the spike; turning the
// object would make the hitbox bigger than the spike.
const spikeGeometry = new THREE.ConeGeometry(0.5, SPIKE_HEIGHT, 4).rotateY(Math.PI / 4);
const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0xff3366 });

// onCeiling: hang it upside down from the ceiling instead of standing on the road.
// height: stand it this high up (on top of a raised block) instead of on the road.
function createSpike({ onCeiling = false, height = 0 }) {
  const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
  if (onCeiling) {
    spike.rotation.x = Math.PI;                         // point down
    spike.position.y = CEILING_HEIGHT - SPIKE_HEIGHT / 2;
  } else {
    spike.position.y = height + SPIKE_HEIGHT / 2;       // bottom of the spike sits on the road (or a block)
  }
  return spike;
}

// Each obstacle type: how to build it, and how much to shrink its hitbox.
const TYPES = {
  spike: { create: createSpike, hitboxShrink: SPIKE_HITBOX_SHRINK }
};

export function createObstacles(parent, list) {
  const placed = list.map((object) => {
    const kind = TYPES[object.type];
    const mesh = kind.create(object);
    mesh.position.z = -object.at;
    parent.add(mesh);
    return { at: object.at, mesh, hitboxShrink: kind.hitboxShrink };
  });

  // The hitboxes of the obstacles near the player, for checking if the player hit one.
  // distance: how far along the road the player is.
  function getHitboxes(distance) {
    return placed
      .filter(({ at }) => Math.abs(at - distance) < CHECK_DISTANCE)
      .map(({ mesh, hitboxShrink }) => getHitbox(mesh, hitboxShrink));
  }

  return { getHitboxes };
}
