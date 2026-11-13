// The fourth map, rated "???". A level of its own, about 1.2576 times harder than
// Map 3 (see the "extreme" profile in generate.js). It has dim lights that flash
// to the beat (see lights.js), and a big ship part that takes up 30% of the level.
// Same speed (10) as the others, so the jump rules stay the same.
//
// It follows its song (songs/song4.js), which is half horror, half dynamic
// (1 second = 10 units of road):
//   Horror half   0-686
//     20-597     generated: cube, UFO and spider
//     600-686    hand-made cube run-up to the drop
//   Dynamic half  686-1399
//     686        the drop: a UFO portal right as the fast part starts
//     686-784    hand-made UFO section
//     784-871    generated cube
//     900-1320   the big ship part (generated): 420 units, 30% of the level
//     1320-1399  hand-made cube to the finish
// The song doesn't loop, and its final note lands on the finish line.
import { generateMap, tunnel, PROFILES } from "./generate.js";
import song from "../songs/song4.js";

const spikes = (...list) => list.map((at) => ({ type: "spike", at }));
const row = (from, count) => Array.from({ length: count }, (_, i) => ({ type: "spike", at: from + i }));
const ceilingRow = (from, count) =>
  Array.from({ length: count }, (_, i) => ({ type: "spike", at: from + i, onCeiling: true }));
const portal = (at, mode, theme) => [{ type: "portal", at, mode }, { type: "colors", at, theme }];

// Horror half: generated cube, UFO and spider parts.
const horrorPart = generateMap({ start: 20, end: 600, seed: 10, profile: PROFILES.extreme });

const handmade = [
  // The run-up to the drop.
  ...spikes(612, 620, 621, 629, 630, 631, 640),
  ...row(650, 5),
  { type: "orb", at: 651.3, height: 2 },
  ...spikes(667, 668),

  // The drop: the song turns fast right here, and so does the level.
  ...portal(686, "ufo", "orange"),
  { type: "block", at: 698, length: 3, height: 3 },   // tap up over a pillar
  ...ceilingRow(708, 5),                              // drop under ceiling spikes
  ...row(718, 6),                                     // tap over road spikes
  ...tunnel(732, 12),                                 // small, steady taps
  ...ceilingRow(752, 4),                              // zigzag
  ...row(760, 4),
  ...portal(772, "cube", "crimson"),

  // The finish: quick groups of spikes, right up to the last note.
  ...spikes(1332, 1333, 1334, 1342, 1351, 1352, 1362, 1363, 1364, 1375, 1384, 1385)
];

// Dynamic half: a short generated cube part, then the big ship part.
const cubePart = generateMap({ start: 784, end: 880, seed: 21, profile: PROFILES.extreme });
// Seed 30 ends the ship part at exactly 1320, so it's 420 units: 30% of the level.
const bigShip = generateMap({ start: 900, end: 1320, seed: 30, shipOnly: true, profile: PROFILES.extreme });

export default {
  name: "Map 4",
  length: 1399,               // the finish line, right where the song's final note plays
  speed: 10,
  theme: "black",             // the colors at the start
  lights: "flashing",         // dim, and flashing to the beat
  glitch: true,               // glitchy spikes, portals and walls (see glitch.js)
  song,
  objects: [...horrorPart.objects, ...handmade, ...cubePart.objects, ...bigShip.objects]
};
