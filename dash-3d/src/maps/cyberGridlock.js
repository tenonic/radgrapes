// Cyber Gridlock, rated Hard Demon: 1.5 times harder than Map 3 (see the "hardDemon"
// profile in generate.js), with saws (see saws.js). Same speed (10) as the others, so
// one jump still clears at most 3 spikes.
// It looks like a neon cyber grid: the road and walls are dark with glowing cyan grid
// lines (see grid.js), and the blocks are magenta.
// The first 110 units are hand-made; the rest is built by the level generator. The
// finish line is at 1029 (1 minute 43 seconds), right where the song's final note
// plays; the song never loops.
import { generateMap, PROFILES } from "./generate.js";
import song from "../songs/song6.js";

const spikes = (...list) => list.map((at) => ({ type: "spike", at }));
const saw = (at, height = 0, radius = 1) => ({ type: "saw", at, height, radius });

const handmade = [
  // Saws right away: one half-buried in the road, then spikes, then a pair of saws.
  saw(20),
  ...spikes(29, 30),
  saw(39), saw(41.2),
  ...spikes(51, 52, 53),

  // Jump onto a low block, then over a small saw on top of it.
  { type: "block", at: 62, length: 10, height: 1 },
  saw(68, 1, 0.8),
  ...spikes(80, 81),

  // A short ship part: fly over or under a big floating saw.
  { type: "portal", at: 88, mode: "ship" },
  saw(98, 2.5, 1.3),
  { type: "portal", at: 106, mode: "cube" }
];

// The generated rest. Seed 6 always builds exactly the same level.
const generated = generateMap({ start: 112, end: 1000, seed: 6, profile: PROFILES.hardDemon });

export default {
  name: "Cyber Gridlock",
  length: 1029,               // the finish line, right where the song's final note plays
  speed: 10,
  theme: "cyber",             // neon cyan grid lines, magenta blocks
  grid: true,                 // the road and walls get the glowing grid look
  song,
  objects: [...handmade, ...generated.objects]
};
