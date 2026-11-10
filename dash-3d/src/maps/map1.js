// The first map. Distances are measured along the road from the start, in units.
// (The cube is 1 unit wide. At speed 10, one jump covers about 5.6 units of road
// and clears at most 3 spikes in a row.)
// Singles, doubles and triples are mixed, with uneven gaps, so the rhythm is hard to guess.
export default {
  name: "Map 1",
  length: 215,     // where the finish line is
  speed: 10,       // the normal speed, in units per second; this map takes about 21 seconds

  obstacles: [
    { type: "spike", at: 18 },                                // single
    { type: "spike", at: 30 }, { type: "spike", at: 31 },     // double
    { type: "spike", at: 39 },                                // single, right after landing
    { type: "spike", at: 52 }, { type: "spike", at: 53 }, { type: "spike", at: 54 },  // triple
    { type: "spike", at: 64 },                                // single
    { type: "spike", at: 73 },                                // single
    { type: "spike", at: 85 }, { type: "spike", at: 86 },     // double
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
    { type: "spike", at: 202 }, { type: "spike", at: 203 }, { type: "spike", at: 204 }   // triple
  ]
};
