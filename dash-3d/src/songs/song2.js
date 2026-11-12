// Song 2 (Map 2): an original, fast and intense electronic song in D minor,
// 150 beats per minute. One section is 4 bars = 6.4 seconds.
// 16 sections = about 102 seconds; then it loops. How songs are played is in src/music.js.

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" for minor or "M" for major].
// A major (instead of A minor) gives the tense pull back to D minor.
const Dm = [38, "m"], Bb = [34, "M"], C = [36, "M"], A = [33, "M"], Gm = [43, "m"];

// Melody notes are MIDI numbers (74 = D5, 77 = F5, 81 = A5, 86 = D6, ...).
const sections = {
  // The main tune: jumps up the chord, then runs down.
  A: {
    chords: [Dm, Bb, C, A],
    melody: [
      74, _, 77, _,  81, _, 77, _,  74, _, 81, _,  79, 77, 76, _,
      74, _, 77, _,  82, _, 77, _,  74, _, 82, _,  81, 79, 77, _,
      76, _, 79, _,  84, _, 79, _,  76, _, 84, _,  82, 81, 79, _,
      81, _, _, 79,  77, _, 76, _,  73, _, 76, _,  81, _, _, _
    ]
  },
  // A driving riff with quick repeated notes, higher up.
  B: {
    chords: [Gm, Dm, Bb, A],
    melody: [
      79, 79, _, 82,  _, 79, 86, _,  84, _, 82, _,  81, _, 79, _,
      77, 77, _, 81,  _, 77, 86, _,  84, _, 81, _,  77, _, 74, _,
      77, 77, _, 82,  _, 77, 86, _,  89, _, 86, _,  84, _, 82, _,
      81, _, 85, _,   88, _, 85, _,  81, _, 76, _,  73, _, 76, _
    ]
  },
  // No melody, just chords: the intro, and a short breather in the middle.
  INTRO: { chords: [Dm, Dm, Bb, A], melody: null },
  // Choppy chord stabs instead of a melody, building up.
  BREAK: { chords: [Bb, C, Dm, Dm], melody: null }
};

// Instruments: lead, pluck, arp, stab, pad, bass, kick, snare, clap, hat, shaker, crash.
const ALL = "lead pluck arp pad bass kick snare clap hat shaker crash";
const arrangement = [
  { section: "INTRO", play: "pad arp bass hat" },
  { section: "INTRO", play: "pad arp bass kick hat shaker" },
  { section: "A",     play: "lead pad bass kick hat shaker crash" },
  { section: "A",     play: ALL },
  { section: "B",     play: ALL },
  { section: "B",     play: ALL },
  { section: "BREAK", play: "stab bass kick hat shaker crash" },
  { section: "BREAK", play: "stab pluck arp bass kick snare clap hat" },
  { section: "A",     play: ALL },
  { section: "B",     play: ALL },
  { section: "A",     play: "lead pluck stab bass kick snare clap hat shaker crash" },
  { section: "B",     play: ALL },
  { section: "INTRO", play: "pad arp bass crash" },
  { section: "BREAK", play: "stab arp bass kick hat shaker" },
  { section: "A",     play: ALL },
  { section: "B",     play: ALL }
];

export default { bpm: 150, sections, arrangement };
