// The second map, rated Insane. Same rules and objects as Map 1 (see map1.js), at the
// same speed, so one jump still clears at most 3 spikes. It's harder because there's
// less room between obstacles, triples show up from the start, and the ship, spider
// and UFO sections come around more often.
// The first 250 units (25 seconds) are hand-made; the rest, up to about 1800 units
// (about 3 minutes), is built by the level generator with the "insane" profile.
import { generateMap, PROFILES } from "./generate.js";
import song from "../songs/song2.js";

const handmade = [
  // A quick start: single, double, then straight into a triple.
  { type: "spike", at: 20 },
  { type: "spike", at: 32 }, { type: "spike", at: 33 },
  { type: "spike", at: 43 }, { type: "spike", at: 44 }, { type: "spike", at: 45 },
  { type: "spike", at: 55 },
  { type: "spike", at: 64 }, { type: "spike", at: 65 },

  // Five spikes with an orb.
  { type: "spike", at: 76 }, { type: "spike", at: 77 }, { type: "spike", at: 78 },
  { type: "spike", at: 79 }, { type: "spike", at: 80 },
  { type: "orb", at: 77.3, height: 2 },

  { type: "spike", at: 91 }, { type: "spike", at: 92 }, { type: "spike", at: 93 },
  { type: "spike", at: 102 },

  // A jump pad onto a tall block, then a double right after dropping off.
  { type: "pad", at: 110 },
  { type: "block", at: 114, length: 8, height: 2 },
  { type: "spike", at: 130 }, { type: "spike", at: 131 },

  // A short, tight ship section.
  { type: "portal", at: 140, mode: "ship" },
  { type: "colors", at: 140, theme: "teal" },
  { type: "block", at: 153, length: 3, height: 3 },                 // climb over
  { type: "spike", at: 163, onCeiling: true }, { type: "spike", at: 164, onCeiling: true },
  { type: "spike", at: 165, onCeiling: true }, { type: "spike", at: 166, onCeiling: true },
  { type: "spike", at: 167, onCeiling: true }, { type: "spike", at: 168, onCeiling: true },   // dip under
  { type: "block", at: 175, length: 3, height: 2 },                 // squeeze through the gap
  { type: "spike", at: 175, onCeiling: true }, { type: "spike", at: 176, onCeiling: true },
  { type: "spike", at: 177, onCeiling: true },
  { type: "spike", at: 185 }, { type: "spike", at: 186 }, { type: "spike", at: 187 },
  { type: "spike", at: 188 }, { type: "spike", at: 189 }, { type: "spike", at: 190 },
  { type: "spike", at: 191 }, { type: "spike", at: 192 },           // stay up
  { type: "portal", at: 200, mode: "cube" },
  { type: "colors", at: 200, theme: "crimson" },

  // Back to the cube.
  { type: "spike", at: 212 }, { type: "spike", at: 213 }, { type: "spike", at: 214 },
  { type: "spike", at: 223 },
  { type: "spike", at: 232 }, { type: "spike", at: 233 },
  { type: "spike", at: 242 }
];

// The generated rest. Seed 2 always builds exactly the same level.
const generated = generateMap({ start: 252, end: 1800, seed: 2, profile: PROFILES.insane });

export default {
  name: "Map 2",
  length: generated.length,   // where the finish line is
  speed: 10,                  // same speed as Map 1, so the jump rules stay the same
  theme: "crimson",           // the colors at the start
  song,
  objects: [...handmade, ...generated.objects]
};
