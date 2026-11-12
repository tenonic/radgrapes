// The third map, rated Demon. Same rules and objects as Map 1 (see map1.js), at the
// same speed, so one jump still clears at most 3 spikes.
// Its special part: "3-gap" tunnels (see tunnel() in generate.js). Spikes below and above
// leave only 3 units between their tips, so the ship (or UFO) has to fly straight through.
// The first 307 units (about 30 seconds) are hand-made; the rest, up to about 1600 units
// (about 2.7 minutes), is built by the level generator with the "demon" profile.
import { generateMap, tunnel, PROFILES } from "./generate.js";
import song from "../songs/song3.js";

const spikes = (...list) => list.map((at) => ({ type: "spike", at }));
const ceilingSpikes = (from, count) =>
  Array.from({ length: count }, (_, i) => ({ type: "spike", at: from + i, onCeiling: true }));

const handmade = [
  // Fast from the first second: groups with little room between them.
  ...spikes(20, 30, 31, 40, 41, 42, 51, 60, 61, 62, 71, 72),

  // Five spikes with an orb, then a triple.
  ...spikes(82, 83, 84, 85, 86),
  { type: "orb", at: 83.3, height: 2 },
  ...spikes(95, 96, 97),

  // A jump pad onto a tall block, then a single spike after dropping off.
  { type: "pad", at: 105 },
  { type: "block", at: 109, length: 8, height: 2 },
  ...spikes(124),

  // The UFO section, with two 3-gap tunnels: tap to stay level.
  { type: "portal", at: 135, mode: "ufo" },
  { type: "colors", at: 135, theme: "orange" },
  { type: "block", at: 147, length: 3, height: 3 },   // climb over
  ...tunnel(158, 20),                                  // drop into the first tunnel and hold steady
  ...spikes(188, 189, 190, 191, 192, 193, 194, 195),   // stay up
  ...tunnel(205, 30),                                  // a longer one
  { type: "block", at: 245, length: 3, height: 2 },   // squeeze through the gap
  ...ceilingSpikes(245, 3),
  { type: "portal", at: 257, mode: "cube" },
  { type: "colors", at: 257, theme: "black" },

  // Back to the cube.
  ...spikes(268, 269, 270, 278, 287, 288, 297)
];

// The generated rest. Seed 3 always builds exactly the same level.
const generated = generateMap({ start: 307, end: 1600, seed: 3, profile: PROFILES.demon });

export default {
  name: "Map 3",
  length: generated.length,   // where the finish line is
  speed: 10,                  // same speed as Map 1, so the jump rules stay the same
  theme: "black",             // the colors at the start
  song,
  objects: [...handmade, ...generated.objects]
};
