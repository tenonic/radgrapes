// Level generator: builds a long stretch of map out of tested patterns
// (spike groups, orb rows, jump pads, block stairs, and ship, spider and UFO sections).
//
// It uses a "seeded" random number generator: the same seed always gives the same
// numbers, so the generated level is exactly the same on every attempt.
//
// Spacing rules (at speed 10, one jump covers about 5.8 units):
// - Spike groups are 1 to 3 spikes, with room after the last spike to land and react.
// - Every pattern leaves room to land before the next one starts.
// - Gaps shrink a little as the level goes on.
// How hard it is comes from a "profile" (see PROFILES below).

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

// How hard the generated level is.
// - gap: room after a spike group at the start, [min, max]; it shrinks by "shrink" toward the end.
// - singleChance: how often a spike group is a single (otherwise a double).
// - tripleFrom, tripleChance: past this point (0 = start, 1 = end), a group becomes
//   a triple this often.
// - cubeTighten: how much less room is left after orb rows, pads and stairs.
// - modeTighten: how much less room is left between ship, spider and UFO obstacles.
// - stretch: how long each cube part is, [min, max], between ship, spider and UFO sections.
// - finalRoom: no new ship/spider/UFO section starts this close to the end.
// - cubeThemes: the colors used for the cube parts, in turn.
export const PROFILES = {
  harder: {
    gap: [14, 17], shrink: 3, singleChance: 0.6, tripleFrom: 0.5, tripleChance: 0.1,
    cubeTighten: 0, modeTighten: 0, stretch: [200, 280], finalRoom: 250,
    cubeThemes: ["blue", "purple"]
  },
  insane: {
    gap: [11, 14], shrink: 3, singleChance: 0.35, tripleFrom: -1, tripleChance: 0.3,
    cubeTighten: 2, modeTighten: 3, stretch: [100, 150], finalRoom: 150,
    cubeThemes: ["purple", "crimson"]
  }
};

// start: where the generated part begins. end: roughly where it should finish.
// seed: which version of the level to build. profile: how hard it is (see PROFILES).
// Returns { objects, length } where length is the finish line.
export function generateMap({ start, end, seed, profile = PROFILES.harder }) {
  const p = profile;
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

  // Room after a spike group: the profile's gap at first, shrinking toward the end.
  const gap = () => {
    const shrink = Math.round(p.shrink * difficulty());
    return between(p.gap[0] - shrink, p.gap[1] - shrink);
  };
  // Room after orb rows, pads and stairs.
  const cubeRoom = () => between(10 - p.cubeTighten, 13 - p.cubeTighten);
  // Room between ship, spider and UFO obstacles: "min" is the easiest (harder) value.
  const modeRoom = (min) => between(min - p.modeTighten, min + 3 - p.modeTighten);

  // ---------- Cube patterns ----------

  // 1 to 3 spikes in a row.
  function spikeGroup() {
    let count = chance(p.singleChance) ? 1 : 2;
    if (difficulty() > p.tripleFrom && chance(p.tripleChance)) count = 3;
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
    cursor += 13 + cubeRoom();
  }

  // Two blocks like stairs: jump onto the low one, then the high one, then drop down.
  function stairs() {
    block(cursor + 3, 10, 1);
    block(cursor + 13, 8, 2);
    cursor += 21 + cubeRoom();
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
        cursor += 3 + modeRoom(13);
      } else if (kind === "roadRow") {
        spikeRow(cursor, 8);
        cursor += 7 + modeRoom(12);
      } else if (kind === "ceilingRow") {
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + modeRoom(12);
      } else {
        // A low pillar with spikes above it: fly through the gap between them.
        block(cursor, 3, 2);
        spikeRow(cursor, 3, ceilingSpike);
        cursor += 2 + modeRoom(13);
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
      cursor += length - 1 + modeRoom(12);     // time to teleport
    }
  }

  // UFO: tap to climb over pillars and rows, stay in the middle of corridors.
  function ufoFeatures() {
    const count = between(6, 8);
    for (let i = 0; i < count; i++) {
      const kind = pick(["roadRow", "corridor", "pillar", "ceilingRow", "squeeze"]);
      if (kind === "roadRow") {
        spikeRow(cursor, 8);
        cursor += 7 + modeRoom(12);
      } else if (kind === "corridor") {
        spikeRow(cursor, 6);
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + modeRoom(12);
      } else if (kind === "pillar") {
        block(cursor, 3, 3);
        cursor += 3 + modeRoom(13);
      } else if (kind === "ceilingRow") {
        spikeRow(cursor, 6, ceilingSpike);
        cursor += 5 + modeRoom(12);
      } else {
        block(cursor, 3, 2);
        spikeRow(cursor, 3, ceilingSpike);
        cursor += 2 + modeRoom(13);
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
    objects.push({ type: "colors", at: cursor, theme: p.cubeThemes[cubeTheme++ % p.cubeThemes.length] });
    cursor += 12;                       // room to fall back to the road as a cube
  }

  // ---------- Build the level ----------

  const modes = ["ship", "spider", "ufo"];
  let modeIndex = 0;
  while (cursor < end - p.finalRoom) {
    cubeStretch(between(p.stretch[0], p.stretch[1]));
    if (cursor < end - p.finalRoom) modeSection(modes[modeIndex++ % modes.length]);
  }
  cubeStretch(Math.max(end - cursor - 20, 30));   // one last cube stretch to the finish

  return { objects, length: cursor + 10 };
}
