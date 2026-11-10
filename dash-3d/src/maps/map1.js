// The first map. Distances are measured along the road from the start, in units.
// (The cube is 1 unit wide. At speed 10, one jump covers about 5.6 units of road
// and clears at most 3 spikes in a row.)
// Singles, doubles and triples are mixed, with uneven gaps, so the rhythm is hard to guess.
//
// Objects:
//   { type: "spike", at }          a spike on the road
//   { type: "orb", at, height }    a jump orb; height is how high its center floats
export default {
  name: "Map 1",
  length: 215,     // where the finish line is
  speed: 10,       // the normal speed, in units per second; this map takes about 21 seconds

  objects: [
    { type: "spike", at: 18 },                                // single
    { type: "spike", at: 30 }, { type: "spike", at: 31 },     // double
    { type: "spike", at: 39 },                                // single, right after landing
    { type: "spike", at: 52 }, { type: "spike", at: 53 }, { type: "spike", at: 54 },  // triple
    { type: "spike", at: 64 },                                // single

    // Five spikes: too long for one jump. Jump, then hit the orb at the top.
    { type: "spike", at: 74 }, { type: "spike", at: 75 }, { type: "spike", at: 76 },
    { type: "spike", at: 77 }, { type: "spike", at: 78 },
    { type: "orb", at: 75.3, height: 2 },

    { type: "spike", at: 87 }, { type: "spike", at: 88 },     // double
    { type: "spike", at: 96 },                                // single
    { type: "spike", at: 104 }, { type: "spike", at: 105 }, { type: "spike", at: 106 },  // triple
    { type: "spike", at: 118 }, { type: "spike", at: 119 },   // double
    { type: "spike", at: 127 },                               // single, right after landing
    { type: "spike", at: 139 },                               // single
    { type: "spike", at: 148 }, { type: "spike", at: 149 },   // double
    { type: "spike", at: 160 }, { type: "spike", at: 161 }, { type: "spike", at: 162 },  // triple
    { type: "spike", at: 171 },                               // single
    { type: "spike", at: 181 }, { type: "spike", at: 182 },   // double
    { type: "spike", at: 190 },                               // single

    // Five spikes with an orb, to finish.
    { type: "spike", at: 200 }, { type: "spike", at: 201 }, { type: "spike", at: 202 },
    { type: "spike", at: 203 }, { type: "spike", at: 204 },
    { type: "orb", at: 201.3, height: 2 }
  ]
};
