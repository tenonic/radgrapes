// Song 5 (Void Sovereign): an original, dark and epic electronic song in B minor,
// 160 beats per minute. One section is 4 bars = 6 seconds. 20 sections = 120 seconds.
// It plays once and never loops, and it's different all the way to the end: no section
// is ever played in the same key twice. It ends on a final note right at the finish line.
// How songs are played is in src/music.js.
//
// It sounds like the void, but fast and electronic: a big echo that rings for seconds,
// wide ghostly pads, and a harsh "cluster" chord, over driving drums (a hard kick on
// every beat, hi-hats on every step), a fast rolling bass, a huge "supersaw" lead,
// buzzy square-wave arpeggios, pumping and distortion. Sections come back in higher
// and higher keys, so it keeps climbing.

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" minor, "M" major, "x" cluster (harsh)].
const Bm = [35, "m"], G = [43, "M"], D = [38, "M"], Fs = [42, "M"], Em = [40, "m"], Cx = [36, "x"];

// Melody notes are MIDI numbers (83 = B5, 86 = D6, 90 = F#6, ...).
const sections = {
  // Rising runs, climbing higher every bar.
  ASCEND: {
    chords: [G, D, Em, Fs],
    melody: [
      79, 81, 83, 84,  86, _, 83, _,  86, 88, 90, 91,  93, _, _, _,
      78, 79, 81, 83,  85, _, 81, _,  85, 86, 88, 90,  93, _, _, _,
      76, 78, 79, 81,  83, _, 79, _,  83, 85, 86, 88,  91, _, _, _,
      78, _, 82, _,    85, _, 90, _,  94, _, 90, _,    97, _, _, _
    ]
  },
  // Triumphant octave jumps.
  REIGN: {
    chords: [Bm, Em, Cx, Fs],
    melody: [
      71, _, 83, _,  71, _, 83, _,  86, _, 85, _,  83, _, 78, _,
      76, _, 88, _,  76, _, 88, _,  91, _, 90, _,  88, _, 83, _,
      72, _, 84, _,  73, _, 85, _,  91, _, 90, _,  85, _, 84, _,
      78, _, 90, _,  82, _, 94, _,  97, _, 94, _,  90, _, _, _
    ]
  },
  // The ending: one last note and chord, then silence.
  END: { chords: [Bm, Bm, Bm, Bm], melody: [95, ...Array(63).fill(_)] },
  // The void: dark chords, no melody.
  VOID: { chords: [Bm, Cx, G, Fs], melody: null },
  // The main theme: slow, wide steps.
  THRONE: {
    chords: [Bm, G, D, Fs],
    melody: [
      83, _, _, 86,  _, _, 90, _,  88, _, 86, _,  83, _, _, _,
      79, _, _, 83,  _, _, 86, _,  88, _, 86, _,  83, _, 79, _,
      78, _, _, 81,  _, _, 86, _,  90, _, 88, _,  86, _, 85, _,
      85, _, _, _,   82, _, 85, _,  90, _, _, _,   94, _, _, _
    ]
  },
  // A hammering riff.
  MARCH: {
    chords: [Em, Bm, G, Fs],
    melody: [
      88, 88, 91, 88,  95, _, 91, 88,  88, 88, 91, 88,  93, _, 91, _,
      86, 86, 90, 86,  95, _, 90, 86,  86, 86, 90, 86,  93, _, 90, _,
      86, 86, 91, 86,  98, _, 91, 86,  86, 86, 91, 86,  95, _, 93, _,
      90, _, 94, _,    97, _, 94, _,   90, _, 85, _,    82, _, 78, _
    ]
  },
  // Chaos: racing runs, with the harsh cluster chord in the middle.
  COLLAPSE: {
    chords: [Bm, Cx, Bm, Fs],
    melody: [
      83, 86, 90, 95,  83, 86, 90, 95,  98, 95, 90, 86,  83, _, _, _,
      84, 85, 91, 96,  84, 85, 91, 96,  97, 96, 91, 85,  84, _, _, _,
      83, 86, 90, 95,  83, 86, 90, 95,  98, 95, 90, 86,  83, _, 86, _,
      78, 82, 85, 90,  78, 82, 85, 90,  94, _, 97, _,    102, _, _, _
    ]
  }
};

const ALL = "lead pluck arp stab pad bass kick snare clap hat crash";
// Every section is played in a key it hasn't been played in before.
const arrangement = [
  { section: "VOID",     play: "pad arp bass hat riser" },
  { section: "THRONE",   play: ALL },
  { section: "MARCH",    play: ALL },
  { section: "COLLAPSE", play: ALL + " roll" },
  { section: "ASCEND",   play: ALL },
  { section: "VOID",     play: "stab arp bass kick hat crash riser", transpose: 1 },
  { section: "THRONE",   play: ALL, transpose: 2 },
  { section: "REIGN",    play: ALL },
  { section: "MARCH",    play: ALL + " roll", transpose: 2 },
  { section: "COLLAPSE", play: ALL, transpose: 2 },
  { section: "ASCEND",   play: ALL, transpose: 3 },
  { section: "VOID",     play: "pad stab bass kick snare hat roll riser", transpose: 3 },
  { section: "REIGN",    play: ALL, transpose: 3 },
  { section: "MARCH",    play: ALL, transpose: 5 },
  { section: "THRONE",   play: ALL, transpose: 5 },
  { section: "COLLAPSE", play: ALL + " roll", transpose: 5 },
  { section: "ASCEND",   play: ALL, transpose: 7 },
  { section: "REIGN",    play: ALL + " roll", transpose: 7 },
  { section: "COLLAPSE", play: ALL + " roll riser", transpose: 7 },
  { section: "END",      play: "lead pad crash", transpose: 7 }
];

const style = {
  reverb: 0.25,                  // still a big echo, for the void...
  reverbSeconds: 2.5,            // ...but tighter, so the fast parts stay sharp
  pump: true,                    // everything pumps with the kick
  hardKick: true,
  distortion: 0.2,               // electronic grit
  bassEvery: 1,                  // a fast rolling bass on every step
  arpOctave: 48,                 // a high, fast arpeggio, like far-away stars
  drums: {
    kick:   "x...x...x...x...",  // driving: every beat
    snare:  "....x.......x...",
    clap:   "....x.......x..x",
    hat:    "xxxxxxxxxxxxxxxx",  // hi-hats on every step
    shaker: ".x.x.x.x.x.x.x.x"
  },
  sounds: {
    lead:  { volume: 0.03, detune: 28, voices: 7, cutoff: 7000, attack: 0.001, release: 0.25 },
    pluck: { volume: 0.03, wave: "square", detune: 6, cutoff: 6000, attack: 0.001, release: 0.04 },
    arp:   { volume: 0.028, wave: "square", detune: 5, cutoff: 7000, attack: 0.001, release: 0.08 },
    pad:   { volume: 0.02, detune: 40, voices: 6, cutoff: 2500, attack: 0.3, release: 1.5 },
    stab:  { volume: 0.028, detune: 30, voices: 5, cutoff: 6000, attack: 0.001, release: 0.06 },
    growl: { volume: 0.14, cutoff: 1800, release: 0.03 }
  }
};

export default { loop: false, parts: [{ bpm: 160, sections, arrangement, style }] };
