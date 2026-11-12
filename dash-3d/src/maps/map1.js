// The first map. Distances are measured along the road from the start, in units.
// The first 715 units (about 72 seconds) are written by hand, below. The rest, up to
// about 6435 units (about 11 minutes), is built by the level generator (generate.js).
// (The cube is 1 unit wide. At speed 10, one jump covers about 5.6 units of road
// and clears at most 3 spikes in a row.)
// Singles, doubles and triples are mixed, with uneven gaps, so the rhythm is hard to guess.
//
// Objects:
//   { type: "spike", at }          a spike on the road
//   { type: "spike", at, onCeiling: true }   a spike hanging from the ceiling (spider sections)
//   { type: "orb", at, height }    a jump orb; height is how high its center floats
//   { type: "pad", at, height }    a jump pad: launches the cube high, no press needed.
//                                  height (optional) puts it on top of a raised block.
//   { type: "block", at, length, height }   a raised road section; "at" is where it starts
//   { type: "portal", at, mode }   changes the player to "cube", "ship", "spider" or "ufo".
//                                  Ship, spider and UFO sections get a ceiling, up to the next portal.
//   { type: "colors", at, theme }  fades the sky, road, walls and blocks into a new color theme
//                                  (purple, teal, blue, green or orange; see themes.js).
import { generateMap } from "./generate.js";

// The hand-made first part.
const handmade = [
    // Easy start: two singles with lots of room, then one double.
    { type: "spike", at: 25 },                                // single
    { type: "spike", at: 40 },                                // single
    { type: "spike", at: 53 }, { type: "spike", at: 54 },     // double

    // Five spikes: too long for one jump. Jump, then hit the orb at the top.
    { type: "spike", at: 74 }, { type: "spike", at: 75 }, { type: "spike", at: 76 },
    { type: "spike", at: 77 }, { type: "spike", at: 78 },
    { type: "orb", at: 75.3, height: 2 },

    // After the orb: room to land, then evenly spaced groups.
    { type: "spike", at: 92 }, { type: "spike", at: 93 },     // double
    { type: "spike", at: 106 },                               // single
    { type: "spike", at: 119 }, { type: "spike", at: 120 },   // double
    { type: "spike", at: 131 },                               // single
    { type: "spike", at: 148 }, { type: "spike", at: 149 },   // double
    { type: "spike", at: 160 }, { type: "spike", at: 161 }, { type: "spike", at: 162 },  // triple
    { type: "spike", at: 171 },                               // single
    { type: "spike", at: 181 }, { type: "spike", at: 182 },   // double
    { type: "spike", at: 190 },                               // single

    // Five spikes with an orb.
    { type: "spike", at: 200 }, { type: "spike", at: 201 }, { type: "spike", at: 202 },
    { type: "spike", at: 203 }, { type: "spike", at: 204 },
    { type: "orb", at: 201.3, height: 2 },

    // Raised road: jump up onto a low block, then up again onto a higher one,
    // then drop back down to the road.
    { type: "block", at: 218, length: 10, height: 1 },
    { type: "block", at: 228, length: 8, height: 2 },
    { type: "spike", at: 246 },

    // Ship section: hold jump to fly over pillars and a long row of spikes.
    { type: "portal", at: 255, mode: "ship" },
    { type: "colors", at: 255, theme: "teal" },
    { type: "block", at: 268, length: 3, height: 2 },
    { type: "block", at: 280, length: 3, height: 3 },
    { type: "spike", at: 286 }, { type: "spike", at: 287 }, { type: "spike", at: 288 },
    { type: "spike", at: 289 }, { type: "spike", at: 290 }, { type: "spike", at: 291 },
    { type: "spike", at: 292 }, { type: "spike", at: 293 },
    { type: "block", at: 298, length: 4, height: 2 },
    { type: "block", at: 308, length: 3, height: 3 },
    { type: "portal", at: 320, mode: "cube" },
    { type: "colors", at: 320, theme: "blue" },

    // Back to the cube.
    { type: "spike", at: 332 },                               // single
    { type: "spike", at: 345 }, { type: "spike", at: 346 },   // double
    { type: "spike", at: 358 },                               // single
    { type: "spike", at: 373 },                               // single
    // A jump pad: it launches you onto a block too tall to jump onto normally.
    { type: "pad", at: 380 },
    { type: "block", at: 384, length: 8, height: 2 },

    // Spider section: press jump to teleport between the road and the ceiling.
    { type: "portal", at: 400, mode: "spider" },
    { type: "colors", at: 400, theme: "green" },
    // Spikes on the road: be on the ceiling.
    { type: "spike", at: 410 }, { type: "spike", at: 411 }, { type: "spike", at: 412 }, { type: "spike", at: 413 },
    // Spikes on the ceiling: be on the road.
    { type: "spike", at: 422, onCeiling: true }, { type: "spike", at: 423, onCeiling: true },
    { type: "spike", at: 424, onCeiling: true }, { type: "spike", at: 425, onCeiling: true },
    { type: "spike", at: 434 }, { type: "spike", at: 435 }, { type: "spike", at: 436 }, { type: "spike", at: 437 },
    { type: "spike", at: 446, onCeiling: true }, { type: "spike", at: 447, onCeiling: true },
    { type: "spike", at: 448, onCeiling: true }, { type: "spike", at: 449, onCeiling: true },
    // A bit faster: road, ceiling, road.
    { type: "spike", at: 458 }, { type: "spike", at: 459 },
    { type: "spike", at: 468, onCeiling: true }, { type: "spike", at: 469, onCeiling: true },
    { type: "spike", at: 478 }, { type: "spike", at: 479 },
    // A tall block on the road: stay on the ceiling, then drop down before the ceiling spikes.
    { type: "block", at: 486, length: 4, height: 2 },
    { type: "spike", at: 499, onCeiling: true }, { type: "spike", at: 500, onCeiling: true },
    { type: "portal", at: 505, mode: "cube" },
    { type: "colors", at: 505, theme: "purple" },

    // Cube again, to the finish.
    { type: "spike", at: 518 },                               // single
    { type: "spike", at: 530 }, { type: "spike", at: 531 },   // double
    // Five spikes with an orb.
    { type: "spike", at: 544 }, { type: "spike", at: 545 }, { type: "spike", at: 546 },
    { type: "spike", at: 547 }, { type: "spike", at: 548 },
    { type: "orb", at: 545.3, height: 2 },
    // Climb two blocks, then drop down.
    { type: "block", at: 562, length: 8, height: 1 },
    { type: "block", at: 570, length: 6, height: 2 },
    { type: "spike", at: 588 },

    // UFO section: tap jump for small boosts to stay in the air.
    { type: "portal", at: 600, mode: "ufo" },
    { type: "colors", at: 600, theme: "orange" },
    // A long row of road spikes: keep tapping to stay up.
    { type: "spike", at: 610 }, { type: "spike", at: 611 }, { type: "spike", at: 612 },
    { type: "spike", at: 613 }, { type: "spike", at: 614 }, { type: "spike", at: 615 },
    { type: "spike", at: 616 }, { type: "spike", at: 617 },
    // Spikes above and below: stay in the middle.
    { type: "spike", at: 625 }, { type: "spike", at: 626 }, { type: "spike", at: 627 },
    { type: "spike", at: 628 }, { type: "spike", at: 629 }, { type: "spike", at: 630 },
    { type: "spike", at: 625, onCeiling: true }, { type: "spike", at: 626, onCeiling: true },
    { type: "spike", at: 627, onCeiling: true }, { type: "spike", at: 628, onCeiling: true },
    { type: "spike", at: 629, onCeiling: true }, { type: "spike", at: 630, onCeiling: true },
    // A tall pillar: climb over it.
    { type: "block", at: 640, length: 3, height: 3 },
    // Ceiling spikes: come back down.
    { type: "spike", at: 650, onCeiling: true }, { type: "spike", at: 651, onCeiling: true },
    { type: "spike", at: 652, onCeiling: true }, { type: "spike", at: 653, onCeiling: true },
    { type: "spike", at: 654, onCeiling: true }, { type: "spike", at: 655, onCeiling: true },
    // A low pillar with spikes above it: squeeze through the gap.
    { type: "block", at: 664, length: 3, height: 2 },
    { type: "spike", at: 664, onCeiling: true }, { type: "spike", at: 665, onCeiling: true },
    { type: "spike", at: 666, onCeiling: true },
    // One more tall pillar.
    { type: "block", at: 676, length: 3, height: 3 },
    { type: "portal", at: 690, mode: "cube" },
    { type: "colors", at: 690, theme: "purple" },

    { type: "spike", at: 702 }
];

// The generated rest. Seed 1 always builds exactly the same level.
const generated = generateMap({ start: 715, end: 6435, seed: 1 });

export default {
  name: "Map 1",
  length: generated.length,   // where the finish line is
  speed: 10,                  // the normal speed, in units per second; about 11 minutes in all
  theme: "purple",            // the colors at the start
  objects: [...handmade, ...generated.objects]
};
