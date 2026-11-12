// The wave model: a small dart (an arrowhead) pointing down the road (the -z direction),
// with dark cartoon outlines. The player tilts it up or down as it flies.
//
// Sizes: about 0.9 long and 0.6 wide, and 0.3 tall, centered on its middle.
import * as THREE from "three";
import { withOutline, toon } from "./outline.js";

const LENGTH = 0.9;
const WIDTH = 0.6;
const THICKNESS = 0.3;

export function createWaveModel(color) {
  // A flat arrowhead: a triangle seen from above, given some thickness.
  const shape = new THREE.Shape();
  shape.moveTo(0, LENGTH / 2);                     // the tip
  shape.lineTo(WIDTH / 2, -LENGTH / 2);
  shape.lineTo(0, -LENGTH / 4);                    // a notch at the back
  shape.lineTo(-WIDTH / 2, -LENGTH / 2);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: THICKNESS, bevelEnabled: false });
  geometry.translate(0, 0, -THICKNESS / 2);        // center it
  geometry.rotateX(-Math.PI / 2);                  // lay it flat, tip pointing down the road

  const dart = withOutline(new THREE.Mesh(geometry, toon(color, 0.35)), 1.12);
  const model = new THREE.Group();
  model.add(dart);
  return model;
}
