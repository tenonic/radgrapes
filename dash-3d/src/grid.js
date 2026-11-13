// Neon grid look: for maps with grid: true (Cyber Gridlock). The road and walls become
// dark, with glowing lines in their color, like a cyber grid.
import * as THREE from "three";

const SIZE = 64;              // the picture's size, in pixels
const LINE = 3;               // line thickness, in pixels
const BASE = 28;              // how bright the dark part is (0-255), so the colors still show a little

// A picture of one grid square: dark, with bright lines along its edges.
// repeatX, repeatY: how many squares across and up the surface it's put on.
function createGridTexture(repeatX, repeatY) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext("2d");
  context.fillStyle = `rgb(${BASE},${BASE},${BASE})`;
  context.fillRect(0, 0, SIZE, SIZE);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, SIZE, LINE);
  context.fillRect(0, 0, LINE, SIZE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

// Give a material the grid look. The lines glow in the material's own color.
export function applyGrid(material, repeatX, repeatY) {
  const texture = createGridTexture(repeatX, repeatY);
  material.map = texture;
  material.emissive = material.color;     // shared palette color: follows theme changes
  material.emissiveMap = texture;
  material.emissiveIntensity = 0.9;
}
