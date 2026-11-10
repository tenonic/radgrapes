// The 3D world: the scene that holds everything, the lights, and the renderer
// that draws the scene onto the page.
import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0b2e);         // dark purple sky
  scene.fog = new THREE.Fog(0x1a0b2e, 20, 90);          // far-away things fade into the sky

  // Soft light from everywhere, so nothing is completely black.
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // A "sun" from above and slightly behind, to give the cube shading.
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(5, 10, 7);
  scene.add(sun);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return { scene, renderer };
}
