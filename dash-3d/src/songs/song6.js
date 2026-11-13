// Song 6 (Cyber Gridlock): an original cyber electronic song in F minor,
// 140 beats per minute. One section is 4 bars = about 6.9 seconds. 16 sections =
// about 110 seconds. It plays once and never loops, and it's different all the way
// to the end: no section is ever played in the same key twice. It ends on a final
// note right at the finish line. How songs are played is in src/music.js.
//
// Its sound is in the style of energetic electro-house / chiptune game music (the
// melodies are our own): a "wobble" bass that wah-wahs in time with the beat,
// crunchy bit-crushed square-wave leads and arpeggios like an old game console,
// a pounding kick on every beat with hi-hats on the off-beats, claps, pumping,
// and a glitchy "cluster" chord.

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" minor, "M" major, "x" cluster (harsh)].
const Fm = [41, "m"], Db = [37, "M"], Ab = [44, "M"], Eb = [39, "M"], C = [36, "M"],
  Bbm = [46, "m"], Fx = [41, "x"];

// Melody notes are MIDI numbers (77 = F5, 80 = Ab5, 84 = C6, ...).
const sections = {
  // Starting up: chords only.
  BOOT: { chords: [Fm, Db, Ab, Eb], melody: null },
  // The main tune, bouncing along the grid.
  GRID: {
    chords: [Fm, Db, Ab, Eb],
    melody: [
      77, _, 80, _,  84, _, 80, _,  77, _, 84, _,  82, _, 80, _,
      73, _, 77, _,  80, _, 77, _,  73, _, 80, _,  82, _, 84, _,
      80, _, 84, _,  87, _, 84, _,  80, _, 87, _,  85, _, 84, _,
      82, _, _, 79,  75, _, 79, _,  82, _, 87, _,  91, _, _, _
    ]
  },
  // A hammering riff.
  CIRCUIT: {
    chords: [Bbm, Fm, Db, C],
    melody: [
      82, 82, 85, 82,  89, 82, 85, 82,  82, 82, 85, 82,  89, _, 87, _,
      80, 80, 84, 80,  89, 80, 84, 80,  80, 80, 84, 80,  89, _, 87, _,
      80, 80, 85, 80,  92, 80, 85, 80,  80, 80, 85, 80,  89, _, 87, _,
      84, _, 88, _,    91, _, 88, _,    84, _, 79, _,    76, _, 72, _
    ]
  },
  // Overload: racing runs up and down.
  OVERLOAD: {
    chords: [Fm, C, Db, C],
    melody: [
      77, 80, 84, 89,  77, 80, 84, 89,  92, 89, 84, 80,  84, _, 77, _,
      76, 79, 84, 88,  76, 79, 84, 88,  91, 88, 84, 79,  84, _, 76, _,
      77, 80, 85, 89,  77, 80, 85, 89,  92, 89, 85, 80,  85, _, 77, _,
      76, 79, 84, 88,  91, _, 96, _,    100, _, 96, _,   91, _, 88, _
    ]
  },
  // A glitch: harsh chord stabs, no melody.
  GLITCH: { chords: [Fm, Fx, Db, C], melody: null },
  // The ending: one last note and chord, then silence.
  END: { chords: [Fm, Fm, Fm, Fm], melody: [89, ...Array(63).fill(_)] }
};

// Every section is played in a key it hasn't been played in before.
const ALL = "lead pluck arp stab pad bass kick snare clap hat shaker crash";
const arrangement = [
  { section: "BOOT",     play: "arp bass hat riser" },
  { section: "GRID",     play: ALL },
  { section: "CIRCUIT",  play: ALL },
  { section: "OVERLOAD", play: ALL + " roll" },
  { section: "GLITCH",   play: "stab arp bass kick hat crash riser" },
  { section: "GRID",     play: ALL, transpose: 2 },
  { section: "CIRCUIT",  play: ALL + " roll", transpose: 2 },
  { section: "OVERLOAD", play: ALL, transpose: 2 },
  { section: "BOOT",     play: "stab pluck arp bass kick snare hat roll riser", transpose: 2 },
  { section: "CIRCUIT",  play: ALL, transpose: 3 },
  { section: "GRID",     play: ALL, transpose: 3 },
  { section: "GLITCH",   play: "stab arp bass kick snare clap hat roll riser", transpose: 3 },
  { section: "OVERLOAD", play: ALL, transpose: 3 },
  { section: "CIRCUIT",  play: ALL + " roll", transpose: 5 },
  { section: "OVERLOAD", play: ALL + " roll riser", transpose: 5 },
  { section: "END",      play: "lead pad crash", transpose: 5 }
];

const BPM = 140;
const EIGHTH_NOTES_PER_SECOND = (BPM / 60) * 2;   // the wobble opens and closes on every 8th note

const style = {
  reverb: 0.08,
  pump: true,
  distortion: 0.15,
  crush: 10,                     // crunchy, like an old game console
  bassEvery: 1,                  // a rolling bass on every step...
  drums: {
    kick:   "x...x...x...x...",  // a pounding kick on every beat
    snare:  "....x.......x...",
    clap:   "....x.......x...",
    hat:    "..x...x...x...x.",  // hi-hats on the off-beats
    shaker: "x.xxx.xxx.xxx.xx"
  },
  sounds: {
    lead:  { volume: 0.045, wave: "square", detune: 6, cutoff: 7000, attack: 0.001, release: 0.03 },
    pluck: { volume: 0.03, wave: "square", detune: 4, cutoff: 6000, attack: 0.001, release: 0.02 },
    arp:   { volume: 0.03, wave: "square", cutoff: 6000, attack: 0.001, release: 0.02 },
    pad:   { volume: 0.014, detune: 20, voices: 4, cutoff: 3000, attack: 0.05, release: 0.3 },
    stab:  { volume: 0.032, wave: "square", detune: 12, voices: 3, cutoff: 6000, attack: 0.001, release: 0.03 },
    // ...that wobbles: wah-wah on every 8th note.
    growl: { volume: 0.2, cutoff: 1400, release: 0.03, wobble: EIGHTH_NOTES_PER_SECOND }
  }
};

export default { loop: false, parts: [{ bpm: BPM, sections, arrangement, style }] };
