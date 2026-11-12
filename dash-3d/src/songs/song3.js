// Song 3 (Map 3): an original, extremely intense electronic song, 180 beats per minute.
// One section is 4 bars = about 5.3 seconds. 16 sections = about 85 seconds; then it loops.
// How songs are played is in src/music.js.
//
// It's built to sound very different from Song 2, and much more intense:
// - Dark scale (E "phrygian"): the note F right above E gives it a tense, menacing sound.
// - A hard, distorted kick on every beat, hi-hats on every step, and a rolling bass
//   that plays on every step too.
// - A huge "supersaw" lead (7 detuned copies of each note) and distorted synths.
// - Snare rolls and noise risers that build up into the next section.

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" for minor or "M" for major].
const Em = [40, "m"], F = [41, "M"], C = [36, "M"], B = [35, "M"], Am = [45, "m"];

// Melody notes are MIDI numbers (76 = E5, 77 = F5, 79 = G5, 83 = B5, 88 = E6, ...).
const sections = {
  // The main tune: stabs at E and the tense F right above it.
  A: {
    chords: [Em, F, Em, B],
    melody: [
      76, _, 76, 77,  76, _, 74, _,  76, _, 79, _,  77, _, 76, _,
      77, _, 77, 79,  77, _, 76, _,  77, _, 81, _,  79, _, 77, _,
      76, _, 76, 77,  76, _, 74, _,  76, _, 83, _,  84, _, 83, _,
      83, _, _, 78,   75, _, 78, _,  83, _, 87, _,  90, _, 87, _
    ]
  },
  // A hammering riff: one note repeated on every step, with jumps up.
  B: {
    chords: [Am, Em, F, B],
    melody: [
      81, 81, 84, 81,  88, 81, 84, 81,  81, 81, 84, 81,  89, _, 88, _,
      79, 79, 83, 79,  88, 79, 83, 79,  79, 79, 83, 79,  89, _, 88, _,
      77, 77, 81, 77,  84, 77, 81, 77,  89, _, 88, _,    84, _, 81, _,
      83, 83, 87, 83,  90, 83, 87, 83,  95, _, 90, _,    87, _, 83, _
    ]
  },
  // Chaos: the lead races up and down the chord on every single step.
  C: {
    chords: [Em, F, Em, B],
    melody: [
      76, 79, 83, 88,  76, 79, 83, 88,  76, 79, 83, 88,  89, 88, 83, 79,
      77, 81, 84, 89,  77, 81, 84, 89,  77, 81, 84, 89,  91, 89, 84, 81,
      76, 79, 83, 88,  76, 79, 83, 88,  76, 79, 83, 88,  89, 88, 83, 79,
      83, 87, 90, 95,  83, 87, 90, 95,  83, 87, 90, 95,  96, 95, 90, 87
    ]
  },
  // No melody: chord stabs and a build-up.
  BREAK: { chords: [Em, F, C, B], melody: null }
};

// Instruments: lead, pluck, arp, stab, pad, bass, kick, snare, clap, hat, crash,
// plus "roll" (snare roll in the last bar) and "riser" (a rising rush of noise).
const ALL = "lead pluck arp stab pad bass kick snare clap hat crash";
const arrangement = [
  { section: "A",     play: ALL },
  { section: "B",     play: ALL },
  { section: "C",     play: ALL + " roll" },
  { section: "B",     play: ALL },
  { section: "A",     play: ALL },
  { section: "C",     play: ALL + " roll" },
  { section: "BREAK", play: "stab arp bass hat crash riser" },
  { section: "BREAK", play: "stab pluck arp bass kick hat roll riser" },
  { section: "C",     play: ALL },
  { section: "B",     play: ALL },
  { section: "C",     play: ALL },
  { section: "B",     play: ALL + " roll" },
  { section: "A",     play: ALL },
  { section: "C",     play: ALL },
  { section: "B",     play: ALL },
  { section: "C",     play: ALL + " roll riser" }
];

const style = {
  reverb: 0.03,
  pump: true,
  hardKick: true,
  distortion: 0.35,
  bassEvery: 1,
  drums: {
    hat: "xxxxxxxxxxxxxxxx"   // every step
  },
  sounds: {
    lead:  { volume: 0.03, detune: 25, voices: 7, cutoff: 9000, attack: 0.001, release: 0.03 },
    pluck: { volume: 0.035, wave: "square", detune: 6, cutoff: 7000, attack: 0.001, release: 0.02 },
    arp:   { volume: 0.025, detune: 12, voices: 3, cutoff: 6000, attack: 0.001, release: 0.02 },
    pad:   { volume: 0.012, detune: 30, voices: 5, cutoff: 5000, attack: 0.005, release: 0.05 },
    stab:  { volume: 0.025, detune: 25, voices: 5, cutoff: 8000, attack: 0.001, release: 0.03 },
    growl: { volume: 0.15, cutoff: 3000, release: 0.02 }
  }
};

export default { bpm: 180, sections, arrangement, style };
