// Void Sovereign, rated Extreme Demon: 2 times harder than Map 3 (see the "void"
// profile in generate.js). Same speed (10) as the others, so one jump still clears
// at most 3 spikes; at many spots the room between obstacles is the least that can
// still be done in time.
// Everything is purple, with the throne of the void in the background: a giant
// floating crown, drifting crystal shards and purple clouds (see background.js).
// There are no side walls, so the road floats in the open void and the background
// shows all around it.
// The first 120 units are hand-made; the rest, up to about 1110, is built by the level
// generator. The finish line is at 1140 (1 minute 54 seconds), right where the song's
// final note plays; the song never loops.
import { generateMap, tunnel, PROFILES } from "./generate.js";
import song from "../songs/song5.js";

const spikes = (...list) => list.map((at) => ({ type: "spike", at }));
const ceilingRow = (from, count) =>
  Array.from({ length: count }, (_, i) => ({ type: "spike", at: from + i, onCeiling: true }));

const handmade = [
  // Straight in: triples with the least room between them.
  ...spikes(20, 21, 22, 30, 31, 32, 40, 41, 48, 49, 50),

  // A short ship part with a 3-gap tunnel.
  { type: "portal", at: 62, mode: "ship" },
  { type: "block", at: 74, length: 3, height: 3 },
  ...tunnel(84, 12),
  ...ceilingRow(103, 5),
  { type: "portal", at: 114, mode: "cube" }
];

// The generated rest. Seed 7 always builds exactly the same level.
const generated = generateMap({ start: 126, end: 1120, seed: 7, profile: PROFILES.void });

export default {
  name: "Void Sovereign",
  length: 1140,               // the finish line, right where the song's final note plays
  speed: 10,
  theme: "void",              // purple everything
  background: "void",         // a giant crown, crystal shards and purple clouds
  walls: false,               // no side walls: the road floats in the open void
  song,
  objects: [...handmade, ...generated.objects]
};
