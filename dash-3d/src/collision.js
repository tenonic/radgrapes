// Checks whether two objects touch.
import * as THREE from "three";

// Each object gets an invisible box around it. If the boxes overlap, they touch.
// "shrink" makes a box a little smaller than the object, so a hit only counts
// when it clearly looks like one (the corners of a spike don't count).
export function getHitbox(object, shrink = 0) {
  return new THREE.Box3().setFromObject(object).expandByScalar(-shrink);
}

export function touching(boxA, boxB) {
  return boxA.intersectsBox(boxB);
}
