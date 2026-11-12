// Level generator: builds a long stretch of map out of tested patterns
// (spike groups, orb rows, jump pads, block stairs, and ship, spider and UFO sections).
//
// It uses a "seeded" random number generator: the same seed always gives the same
// numbers, so the generated level is exactly the same on every attempt.
//
// Spacing rules (at speed 10, one jump covers about 5.8 units):
// - Spike groups are 1 to 3 spikes, with at least 11 units after the last spike.
// - Every pattern leaves room to land before the next one starts.
// - Gaps shrink a little and triples get a little more common as the level goes on,
//   but it stays gentle: triples only appear in the second half, and not often.

// A small, well-known seeded random number generator ("mulberry32").
// Returns a function that gives a new number from 0 up to (not including) 1 each call.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODE_THEMES = { ship: "teal", spider: "green", ufo: "orange" };
const CUBE_THEMES = ["blue", "purple"];

// start: where the generated part begins. end: roughly where it should finish.
// seed: which version of the level to build.
// Returns { objects, length } where length is the finish line.
export function generateMap({ start, end, seed }) {
  const random = createRandom(seed);
  const between = (min, max) => min + Math.floor(random() * (max - min + 1));   // whole number, min to max
  const chance = (probability) => random() < probability;
  const pick = (list) => list[Math.floor(random() * list.length)];

  const objects = [];
  const spike = (at) => objects.push({ type: "spike", at });
  const ceilingSpike = (at) => objects.push({ type: "spike", at, onCeiling: true });
  const block = (at, length, height) => objects.push({ type: "block", at, length, height });
  const spikeRow = (at, count, place = spike) => {
    for (let i = 0; i < count; i++) place(at + i);
  };

  // "cursor" is the earliest spot where the next obstacle may go.
  let cursor = start;

  // 0 at the start of the generated part, 1 at the end.
  const difficulty = () => Math.min((cursor - start) / (end - start), 1);

  // Room after a spike group: 14-17 units at first, down to 11-14 near the end.
  const gap = () => {
    const shrink = Math.round(3 * difficulty());
    return between(14 - shrink, 17 - shrink);
  };

  // ---------- Cube patterns ----------

  // 1 to 3 spikes in a row. Mostly singles; triples only in the second half, and rarely.
  function spikeGroup() {
    let count = chance(0.6) ? 1 : 2;
    if (difficulty() > 0.5 && chance(0.1)) count = 3;
    spikeRow(cursor, count);
    cursor += count - 1 + gap();
  }

  // Five spikes: jump, then use the orb at the top.
  function orbRow() {
    spikeRow(cursor, 5);
    objects.push({ type: "orb", at: cursor + 1.3, height: 2 });
    cursor += 18 + between(0, 3);
  }

  // A jump pad that launches you onto a tall block.
  function padBlock() {
    objects.push({ type: "pad", at: cursor + 1 });
    block(cursor + 5, 8, 2);
    cursor += 13 + between(10, 13);
  }

  // Two blocks like stairs: jump onto the low one, then the high one, then drop down.
  function stairs() {
    block(cursor + 3, 10, 1);
    block(cursor + 13, 8, 2);
    cursor += 21 + between(10, 13);
  }

  // A stretch of cube patterns, mostly spike groups.
  function cubeStretch(length) {
    const stop = cursor + length;
    while (cursor < stop) {
      const roll = random();
      if (roll < 0.66) spikeGroup();
      else if (roll < 0.75) orbRow();
      else if (roll < 0.87) padBlock();
      else stairs();
    }
  }

  // ---------- Ship, spider and UFO sections ----------

  // Ship: fly over pillars and spike rows, and under hanging spikes.
  function shipFeatures() {
    const count = between(6, 9);
    for (let i = 0; i < count; i++) {
      const kind = pick(["pillar", "roadRow", "ceilingRow", "squeeze"]);
      if (kind === "pillar") {
        block(cursor, 3, pick([2, 3]));
        cursor += 3 + between(13, 16);
      } else if (kind === "roadRow") {
        spikeRow(cursor, 8);
        cursor += 7 + between(12, 15);
      } else if (kind === "ceilingRow") {
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + between(12, 15);
      } else {
        // A low pillar with spikes above it: fly through the gap between them.
        block(cursor, 3, 2);
        spikeRow(cursor, 3, ceilingSpike);
        cursor += 2 + between(13, 16);
      }
    }
  }

  // Spider: spike groups on the road or the ceiling; be on the other side.
  function spiderFeatures() {
    const count = between(7, 10);
    let onCeiling = chance(0.5);
    for (let i = 0; i < count; i++) {
      if (chance(0.75)) onCeiling = !onCeiling;   // usually switch sides
      const length = between(2, 4);
      spikeRow(cursor, length, onCeiling ? ceilingSpike : spike);
      cursor += length - 1 + between(12, 15);     // plenty of time to teleport
    }
  }

  // UFO: tap to climb over pillars and rows, stay in the middle of corridors.
  function ufoFeatures() {
    const count = between(6, 8);
    for (let i = 0; i < count; i++) {
      const kind = pick(["roadRow", "corridor", "pillar", "ceilingRow", "squeeze"]);
      if (kind === "roadRow") {
        spikeRow(cursor, 8);
        cursor += 7 + between(12, 15);
      } else if (kind === "corridor") {
        spikeRow(cursor, 6);
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + between(12, 15);
      } else if (kind === "pillar") {
        block(cursor, 3, 3);
        cursor += 3 + between(13, 16);
      } else if (kind === "ceilingRow") {
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + between(12, 15);
      } else {
        block(cursor, 3, 2);
        spikeRow(cursor, 3, ceilingSpike);
        cursor += 2 + between(13, 16);
      }
    }
  }

  const FEATURES = { ship: shipFeatures, spider: spiderFeatures, ufo: ufoFeatures };
  let cubeTheme = 0;

  // A portal into a mode, its features, then a portal back to the cube.
  function modeSection(mode) {
    cursor += 2;
    objects.push({ type: "portal", at: cursor, mode });
    objects.push({ type: "colors", at: cursor, theme: MODE_THEMES[mode] });
    cursor += 12;                       // room to get used to the new mode

    FEATURES[mode]();

    cursor += 4;
    objects.push({ type: "portal", at: cursor, mode: "cube" });
    objects.push({ type: "colors", at: cursor, theme: CUBE_THEMES[cubeTheme++ % CUBE_THEMES.length] });
    cursor += 12;                       // room to fall back to the road as a cube
  }

  // ---------- Build the level ----------

  const modes = ["ship", "spider", "ufo"];
  let modeIndex = 0;
  while (cursor < end - 250) {
    cubeStretch(between(200, 280));
    if (cursor < end - 250) modeSection(modes[modeIndex++ % modes.length]);
  }
  cubeStretch(Math.max(end - cursor - 20, 30));   // one last cube stretch to the finish

  return { objects, length: cursor + 10 };
}
