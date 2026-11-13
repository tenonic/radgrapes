// Special backgrounds: for maps with a "background" setting.
// - "void" (Void Sovereign): the throne of the void. Far ahead, a giant crown floats
//   and slowly turns, with glowing gems on its points. Purple crystal shards float
//   beside, above and below the road, drifting past and spinning, and soft purple
//   clouds (nebulas) glow behind everything. The map has no side walls, so all of
//   this shows around the road.
//
// They're added to the scene, not the world, so they stay far away while the road
// moves (like a real sky). They ignore the fog, so they show through it.
import * as THREE from "three";

const CROWN_POSITION = new THREE.Vector3(0, 32, -175);
const CROWN_RADIUS = 30;
const CROWN_POINTS = 8;
const CROWN_SPIN = 0.12;          // radians per second
const SHARD_COUNT = 90;
const SHARD_DRIFT = 4;            // how fast the shards drift toward the camera (units per second)
const SHARD_NEAR = 15;            // a shard that drifts past this (behind the camera)...
const SHARD_FAR = -230;           // ...comes back in far ahead, here
const CLOUD_COLORS = [0x6a1fc0, 0xa02dc8, 0x3d1a8a];

const unlit = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, fog: false, ...extra });

// The giant crown: a band, tall points with a gem on each, and glowing rims.
function createCrown() {
  const crown = new THREE.Group();

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(CROWN_RADIUS, CROWN_RADIUS * 0.9, 12, 48, 1, true),
    unlit(0x2a0a4a, { side: THREE.DoubleSide })
  );
  crown.add(band);

  for (const y of [6, -6]) {          // glowing rims on the top and bottom of the band
    const rim = new THREE.Mesh(new THREE.TorusGeometry(y > 0 ? CROWN_RADIUS : CROWN_RADIUS * 0.9, 0.9, 8, 64), unlit(0xb066ff));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = y;
    crown.add(rim);
  }

  for (let i = 0; i < CROWN_POINTS; i++) {
    const angle = (i / CROWN_POINTS) * Math.PI * 2;
    const x = Math.cos(angle) * CROWN_RADIUS;
    const z = Math.sin(angle) * CROWN_RADIUS;
    const point = new THREE.Mesh(new THREE.ConeGeometry(4, 16, 4), unlit(0x5a1fa0));
    point.position.set(x, 14, z);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.4), unlit(0xe8c8ff));
    gem.position.set(x, 24, z);
    crown.add(point, gem);
  }

  crown.position.copy(CROWN_POSITION);
  crown.rotation.x = 0.25;            // tip it toward the camera a little, so the top shows
  return crown;
}

// Purple crystal shards floating beside, above and below the road (never on it).
function createShards() {
  return Array.from({ length: SHARD_COUNT }, () => {
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(1 + Math.random() * 3),
      unlit(Math.random() < 0.5 ? 0x7a2fe0 : 0xc07aff, { transparent: true, opacity: 0.85 })
    );
    shard.scale.y = 2 + Math.random() * 2;                  // long and pointy
    const side = Math.random() < 0.5 ? -1 : 1;
    shard.position.set(
      side * (9 + Math.random() * 70),                       // clear of the road (6 wide)
      -25 + Math.random() * 70,                              // below, beside and above it
      SHARD_FAR + Math.random() * (SHARD_NEAR - SHARD_FAR)
    );
    shard.userData = {
      spin: (Math.random() - 0.5) * 1.2,
      bob: Math.random() * Math.PI * 2,
      baseY: shard.position.y
    };
    return shard;
  });
}

// A soft, round glow: a picture of a fading circle, drawn once and used for the clouds.
function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

// Big purple clouds (nebulas) far behind everything.
function createClouds() {
  const texture = createGlowTexture();
  return CLOUD_COLORS.map((color, i) => {
    const cloud = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, color, fog: false, transparent: true, opacity: 0.45, depthWrite: false
    }));
    cloud.scale.setScalar(140 + i * 30);
    cloud.position.set((i - 1) * 70, 30 + i * 10, -260);
    return cloud;
  });
}

export function createBackground(scene, kind) {
  if (kind !== "void") return { update() {} };

  const clouds = createClouds();
  const crown = createCrown();
  const shards = createShards();
  scene.add(...clouds, crown, ...shards);

  let time = 0;
  function update(dt) {
    time += dt;
    crown.rotation.y += CROWN_SPIN * dt;
    for (const shard of shards) {
      shard.rotation.y += shard.userData.spin * dt;
      shard.position.z += SHARD_DRIFT * dt;
      if (shard.position.z > SHARD_NEAR) shard.position.z += SHARD_FAR - SHARD_NEAR;
      shard.position.y = shard.userData.baseY + Math.sin(time + shard.userData.bob) * 2;
    }
  }

  return { update };
}
