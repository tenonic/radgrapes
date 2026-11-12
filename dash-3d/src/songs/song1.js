// Song 1 (Map 1): an original, upbeat electronic song in E minor, 120 beats per minute.
// One section is 4 bars = 8 seconds. 9 sections = 72 seconds, as long as the hand-made
// start of Map 1; then it loops. How songs are played is in src/music.js.

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" for minor or "M" for major].
const Em = [40, "m"], C = [36, "M"], G = [43, "M"], D = [38, "M"], Bm = [35, "m"];

// Melody notes are MIDI numbers (64 = E4, 67 = G4, 71 = B4, 76 = E5, ...).
const sections = {
  // The main tune.
  A: {
    chords: [Em, C, G, D],
    melody: [
      76, _, _, 74,  71, _, 67, _,  71, _, 74, _,  76, _, _, _,
      72, _, _, 71,  67, _, 64, _,  67, _, 71, _,  72, _, 74, _,
      74, _, _, 71,  67, _, 71, _,  74, _, 79, _,  78, _, 76, _,
      74, _, _, _,   73, _, 74, _,  78, _, _, _,   74, _, _, _
    ]
  },
  // Higher and brighter: plays during the flying parts.
  B: {
    chords: [C, D, Bm, Em],
    melody: [
      79, _, 76, _,  79, _, 81, _,  79, _, 76, _,  72, _, _, _,
      81, _, 78, _,  81, _, 83, _,  81, _, 78, _,  74, _, _, _,
      83, _, _, 81,  78, _, _, _,   74, _, 78, _,  81, _, 83, _,
      79, _, _, _,   76, _, _, _,   71, _, 74, _,  76, _, _, _
    ]
  },
  // No melody, just chords: used for the intro.
  INTRO: { chords: [Em, C, G, D], melody: null },
  // Choppy chord stabs instead of a melody: plays during the spider part.
  STABS: { chords: [Em, Em, C, D], melody: null }
};

// Instruments: lead, pluck, arp, stab, pad, bass, kick, snare, clap, hat, shaker, crash.
const ALL = "lead pluck arp pad bass kick snare clap hat shaker crash";
const arrangement = [
  { section: "INTRO", play: "pad arp bass hat" },                                   // 0-8 s
  { section: "A",     play: "lead pad bass kick hat shaker crash" },                // 8-16 s
  { section: "A",     play: "lead pluck arp pad bass kick snare clap hat" },        // 16-24 s
  { section: "B",     play: ALL },                                                  // 24-32 s: ship
  { section: "A",     play: "lead pluck pad bass kick snare hat shaker crash" },    // 32-40 s
  { section: "STABS", play: "stab pad bass kick hat shaker crash" },                // 40-48 s: spider
  { section: "STABS", play: "stab pluck arp bass kick snare clap hat shaker" },     // 48-56 s
  { section: "B",     play: ALL },                                                  // 56-64 s: UFO
  { section: "A",     play: ALL }                                                   // 64-72 s: to the finish
];

export default { bpm: 120, sections, arrangement };
