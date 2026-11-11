// Obstacles: built from the map's obstacle list and placed along the road.
// They sit still in the world; the world moves, so they come toward the player.
import * as THREE from "three";
import { getHitbox } from "./collision.js";
import { CEILING_HEIGHT } from "./config.js";

const SPIKE_HEIGHT = 1;
const SPIKE_HITBOX_SHRINK = 0.15;

// A spike is a 4-sided cone: a pyramid.
// onCeiling: hang it upside down from the ceiling instead of standing on the road.
function createSpike({ onCeiling = false }) {
  const geometry = new THREE.ConeGeometry(0.5, SPIKE_HEIGHT, 4);
  // Turn the shape itself (not the object) so a flat side faces the player.
  // Turning the shape keeps the hitbox the same size as the spike; turning the
  // object would make the hitbox bigger than the spike.
  geometry.rotateY(Math.PI / 4);
  const material = new THREE.MeshStandardMaterial({ color: 0xff3366 });
  const spike = new THREE.Mesh(geometry, material);
  if (onCeiling) {
    spike.rotation.x = Math.PI;                         // point down
    spike.position.y = CEILING_HEIGHT - SPIKE_HEIGHT / 2;
  } else {
    spike.position.y = SPIKE_HEIGHT / 2;                // bottom of the spike sits on the road
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
    const at = object.at;
    mesh.position.z = -at;
    parent.add(mesh);
    return { mesh, hitboxShrink: kind.hitboxShrink };
  });

  // The hitboxes of all obstacles, for checking if the player hit one.
  function getHitboxes() {
    return placed.map(({ mesh, hitboxShrink }) => getHitbox(mesh, hitboxShrink));
  }

  return { getHitboxes };
}
