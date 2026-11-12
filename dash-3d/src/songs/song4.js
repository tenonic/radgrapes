// Song 4 (Map 4): an original song that's half horror, half dynamic. It plays once,
// from start to finish, and never loops. No section is ever played the same way twice:
// every repeat is moved to a different key or played with different instruments.
// It ends on a final note right at the finish line.
//
//   1. Horror   0-68.6 s     140 beats per minute, but slow and heavy: eerie music-box
//                            bells, wobbly dark pads, a heartbeat kick, creepy chords
//                            (diminished and clashing "cluster" chords) and lots of echo.
//   2. Dynamic  68.6-145.4 s 175 beats per minute: fast, driving and pumping, with
//                            a rolling bass, hi-hats on every step and a huge lead.
// How songs are played is in src/music.js.

const _ = null;                            // a rest (no new note)

// ---------- Part 1: horror (A minor, with the tense notes around it) ----------

// "d" = diminished (tense), "x" = cluster (harsh and creepy).
const Am = [45, "m"], Bb = [46, "M"], E = [40, "M"], F = [41, "M"], Ddim = [38, "d"], Ax = [45, "x"];

const horrorSections = {
  // Just a dark drone and a music box.
  DRONE: { chords: [Am, Ax, Bb, Am], melody: null },
  // A few lonely bell notes.
  WHISPER: {
    chords: [Am, Bb, Am, E],
    melody: [
      81, _, _, _,  _, _, 80, _,  _, _, _, _,  76, _, _, _,
      _, _, 82, _,  _, _, 81, _,  _, _, 77, _,  _, _, _, _,
      81, _, _, _,  _, _, 84, _,  _, _, _, _,  83, _, _, _,
      _, _, 80, _,  _, _, 76, _,  _, _, 71, _,  _, _, _, _
    ]
  },
  // Something creeping closer, one half-step at a time.
  STALK: {
    chords: [Ddim, Am, Ddim, E],
    melody: [
      74, _, 75, _,  74, _, _, _,  80, _, _, _,  77, _, _, _,
      76, _, 77, _,  76, _, _, _,  72, _, _, _,  69, _, _, _,
      74, _, 75, _,  74, _, _, _,  80, _, 81, _,  80, _, _, _,
      76, _, _, _,   75, _, _, _,  74, _, _, _,  68, _, _, _
    ]
  },
  // A heartbeat and creepy chords, no melody.
  HEARTBEAT: { chords: [Am, F, Ddim, E], melody: null },
  // High, piercing notes.
  SCREAM: {
    chords: [Bb, Ax, Bb, E],
    melody: [
      94, _, _, 93,  _, _, 94, _,  _, _, _, _,  93, _, _, _,
      93, _, _, 92,  _, _, 93, _,  _, _, _, _,  88, _, _, _,
      94, _, _, 93,  _, _, 94, _,  98, _, _, _,  97, _, _, _,
      92, _, _, _,   88, _, _, _,  83, _, _, _,  80, _, _, _
    ]
  }
};

const horror = {
  bpm: 140,
  sections: horrorSections,
  arrangement: [
    { section: "DRONE",     play: "pad arp" },
    { section: "WHISPER",   play: "lead pad arp" },
    { section: "STALK",     play: "lead pad bass kick hat" },
    { section: "HEARTBEAT", play: "pad bass kick snare hat" },
    { section: "WHISPER",   play: "lead pad arp bass kick snare hat", transpose: 1 },
    { section: "SCREAM",    play: "lead pad stab bass kick snare hat crash" },
    { section: "STALK",     play: "lead stab arp bass kick snare clap hat", transpose: 1 },
    { section: "DRONE",     play: "pad arp bass kick", transpose: 1 },
    { section: "SCREAM",    play: "lead stab arp bass kick snare clap hat crash", transpose: 1 },
    { section: "HEARTBEAT", play: "stab pad bass kick snare hat roll riser", transpose: 1 }
  ],
  style: {
    reverb: 0.4,                 // lots of echo, like an empty hall
    hardKick: true,
    bassEvery: 4,                // slow, heavy bass
    arpOctave: 48,               // a tiny, high music box
    drums: {
      kick:  "x..x......x.....",   // a heartbeat: ba-dum ... ba
      snare: "........x.......",   // one heavy hit per bar
      clap:  "........x.......",
      hat:   "..x...x...x...x."
    },
    sounds: {
      lead:  { volume: 0.08, wave: "triangle", detune: 18, cutoff: 5000, attack: 0.005, release: 0.8 },
      pluck: { volume: 0.03, wave: "triangle", cutoff: 4000, release: 0.3 },
      arp:   { volume: 0.04, wave: "sine", cutoff: 9000, attack: 0.002, release: 0.4 },
      pad:   { volume: 0.022, detune: 35, voices: 4, cutoff: 1500, attack: 1.0, release: 1.5 },
      stab:  { volume: 0.035, detune: 30, voices: 4, cutoff: 2500, attack: 0.002, release: 0.3 },
      growl: { volume: 0.12, cutoff: 600, release: 0.2 }
    }
  }
};

// ---------- Part 2: dynamic (A minor, fast) ----------

const C = [36, "M"], G = [43, "M"], Dm = [38, "m"], Am2 = [45, "m"], F2 = [41, "M"], E2 = [40, "M"], Bb2 = [46, "M"];

const dynamicSections = {
  // Chords only: the build-up out of the horror.
  BUILD: { chords: [Dm, E2, Am2, E2], melody: null },
  // A bouncing, upbeat tune.
  LAUNCH: {
    chords: [Am2, F2, C, G],
    melody: [
      81, _, 84, _,  88, _, 84, 81,  86, _, 84, _,  81, _, 79, _,
      77, _, 81, _,  84, _, 81, 77,  84, _, 81, _,  77, _, 76, _,
      76, _, 79, _,  84, _, 79, 76,  83, _, 84, _,  86, _, 88, _,
      86, _, _, 83,  79, _, 83, _,   86, _, 91, _,  89, _, 88, _
    ]
  },
  // A hammering riff.
  DRIVE: {
    chords: [Dm, Am2, F2, E2],
    melody: [
      86, 86, 89, 86,  93, 86, 89, 86,  86, 86, 89, 86,  91, _, 89, _,
      84, 84, 88, 84,  93, 84, 88, 84,  84, 84, 88, 84,  91, _, 88, _,
      84, 84, 89, 84,  96, 84, 89, 84,  84, 84, 89, 84,  93, _, 91, _,
      88, _, 92, _,    95, _, 92, _,    88, _, 83, _,    80, _, 76, _
    ]
  },
  // Long, soaring notes.
  SOAR: {
    chords: [F2, G, Am2, Am2],
    melody: [
      84, _, _, _,  81, _, 84, _,  89, _, _, _,  88, _, 86, _,
      86, _, _, _,  83, _, 86, _,  91, _, _, _,  89, _, 88, _,
      88, _, _, _,  84, _, 88, _,  93, _, _, _,  91, _, 88, _,
      93, _, _, _,  _, _, _, _,    96, _, _, _,  93, _, _, _
    ]
  },
  // Racing runs up the chords.
  RUSH: {
    chords: [Am2, G, F2, E2],
    melody: [
      81, 84, 88, 93,  81, 84, 88, 93,  91, 88, 84, 81,  84, _, 81, _,
      79, 83, 86, 91,  79, 83, 86, 91,  89, 86, 83, 79,  83, _, 79, _,
      77, 81, 84, 89,  77, 81, 84, 89,  88, 84, 81, 77,  81, _, 77, _,
      76, 80, 83, 88,  76, 80, 83, 88,  92, _, 95, _,    100, _, _, _
    ]
  },
  // The horror comes back, but fast: the creepy note right above the root.
  HAUNT: {
    chords: [Am2, Bb2, Am2, E2],
    melody: [
      81, 81, 82, 81,  88, _, 82, 81,  81, 81, 82, 81,  93, _, 92, _,
      82, 82, 81, 82,  89, _, 81, 82,  82, 82, 81, 82,  94, _, 93, _,
      81, 81, 82, 81,  88, _, 82, 81,  84, _, 88, _,    93, _, 96, _,
      92, _, 88, _,    83, _, 80, _,   76, _, 80, _,    83, _, 88, _
    ]
  },
  // The ending: one last note and chord, then silence.
  END: { chords: [Am2, Am2, Am2, Am2], melody: [93, ...Array(63).fill(_)] }
};

const ALL = "lead pluck arp stab pad bass kick snare clap hat crash";
const dynamic = {
  bpm: 175,
  sections: dynamicSections,
  arrangement: [
    { section: "BUILD",  play: "stab arp bass kick hat riser" },
    { section: "LAUNCH", play: ALL },
    { section: "DRIVE",  play: ALL },
    { section: "SOAR",   play: ALL },
    { section: "HAUNT",  play: ALL + " roll" },
    { section: "LAUNCH", play: ALL, transpose: 2 },
    { section: "RUSH",   play: ALL },
    { section: "DRIVE",  play: ALL + " roll", transpose: 2 },
    { section: "BUILD",  play: "stab pluck arp bass kick snare hat roll riser", transpose: 3 },
    { section: "HAUNT",  play: ALL, transpose: 3 },
    { section: "SOAR",   play: ALL, transpose: 3 },
    { section: "RUSH",   play: ALL + " roll", transpose: 3 },
    { section: "RUSH",   play: ALL + " riser", transpose: 5 },
    { section: "END",    play: "lead pad crash" }
  ],
  style: {
    reverb: 0.05,
    pump: true,
    hardKick: true,
    distortion: 0.25,
    bassEvery: 1,
    drums: { hat: "xxxxxxxxxxxxxxxx" },
    sounds: {
      lead:  { volume: 0.035, detune: 18, voices: 5, cutoff: 8000, attack: 0.001, release: 0.04 },
      pluck: { volume: 0.035, wave: "square", detune: 6, cutoff: 7000, attack: 0.001, release: 0.02 },
      arp:   { volume: 0.03, wave: "square", cutoff: 6000, attack: 0.001, release: 0.02 },
      pad:   { volume: 0.014, detune: 25, voices: 4, cutoff: 5000, attack: 0.005, release: 0.6 },
      stab:  { volume: 0.03, detune: 22, voices: 4, cutoff: 8000, attack: 0.001, release: 0.03 },
      growl: { volume: 0.14, cutoff: 2800, release: 0.02 }
    }
  }
};

export default { loop: false, parts: [horror, dynamic] };
