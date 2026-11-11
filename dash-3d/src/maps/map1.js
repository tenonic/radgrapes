// The first map. Distances are measured along the road from the start, in units.
// (The cube is 1 unit wide. At speed 10, one jump covers about 5.6 units of road
// and clears at most 3 spikes in a row.)
// Singles, doubles and triples are mixed, with uneven gaps, so the rhythm is hard to guess.
//
// Objects:
//   { type: "spike", at }          a spike on the road
//   { type: "spike", at, onCeiling: true }   a spike hanging from the ceiling (spider sections)
//   { type: "orb", at, height }    a jump orb; height is how high its center floats
//   { type: "block", at, length, height }   a raised road section; "at" is where it starts
//   { type: "portal", at, mode }   changes the player to "cube", "ship" or "spider".
//                                  Ship and spider sections get a ceiling, up to the next portal.
export default {
  name: "Map 1",
  length: 605,     // where the finish line is
  speed: 10,       // the normal speed, in units per second; this map takes about 1 minute

  objects: [
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
    { type: "block", at: 268, length: 3, height: 2 },
    { type: "block", at: 280, length: 3, height: 3 },
    { type: "spike", at: 286 }, { type: "spike", at: 287 }, { type: "spike", at: 288 },
    { type: "spike", at: 289 }, { type: "spike", at: 290 }, { type: "spike", at: 291 },
    { type: "spike", at: 292 }, { type: "spike", at: 293 },
    { type: "block", at: 298, length: 4, height: 2 },
    { type: "block", at: 308, length: 3, height: 3 },
    { type: "portal", at: 320, mode: "cube" },

    // Back to the cube.
    { type: "spike", at: 332 },                               // single
    { type: "spike", at: 345 }, { type: "spike", at: 346 },   // double
    { type: "spike", at: 358 },                               // single
    { type: "spike", at: 372 }, { type: "spike", at: 373 }, { type: "spike", at: 374 },  // triple
    { type: "spike", at: 387 },                               // single

    // Spider section: press jump to teleport between the road and the ceiling.
    { type: "portal", at: 400, mode: "spider" },
    // Spikes on the road: be on the ceiling.
    { type: "spike", at: 410 }, { type: "spike", at: 411 }, { type: "spike", at: 412 }, { type: "spike", at: 413 },
    // Spikes on the ceiling: be on the road.
    { type: "spike", at: 422, onCeiling: true }, { type: "spike", at: 423, onCeiling: true },
    { type: "spike", at: 424, onCeiling: true }, { type: "spike", at: 425, onCeiling: true },
    { type: "spike", at: 434 }, { type: "spike", at: 435 }, { type: "spike", at: 436 }, { type: "spike", at: 437 },
    { type: "spike", at: 446, onCeiling: true }, { type: "spike", at: 447, onCeiling: true },
    { type: "spike", at: 448, onCeiling: true }, { type: "spike", at: 449, onCeiling: true },
    // Faster: road, ceiling, road.
    { type: "spike", at: 458 }, { type: "spike", at: 459 },
    { type: "spike", at: 466, onCeiling: true }, { type: "spike", at: 467, onCeiling: true },
    { type: "spike", at: 474 }, { type: "spike", at: 475 },
    // A tall block on the road: stay on the ceiling, then drop down past the ceiling spikes.
    { type: "block", at: 484, length: 5, height: 2 },
    { type: "spike", at: 495, onCeiling: true }, { type: "spike", at: 496, onCeiling: true },
    { type: "spike", at: 497, onCeiling: true },
    { type: "portal", at: 505, mode: "cube" },

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
    { type: "spike", at: 588 }                                // last jump
  ]
};
