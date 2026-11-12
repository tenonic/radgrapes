// Music: an original electronic song, made in code with the browser's Web Audio API
// (no music file). Smooth modern synths (detuned, filtered waves) with a bit of reverb,
// rather than retro "chiptune" square waves.
//
// The song is tied to the run: it starts from the beginning when a run starts, and
// stops when the player crashes or finishes. So the same part of the song always
// plays at the same place in the map.
//
// How the song is written:
// - A "step" is a 16th note. At 120 beats per minute, one step is 0.125 seconds.
// - A "section" is 4 bars (64 steps, 8 seconds), with one chord per bar and
//   (optionally) a melody.
// - The ARRANGEMENT lists the sections in order and which instruments play in each.
//   9 sections = 72 seconds, about as long as Map 1. After that, it loops.

import { onAudioReady, getNoise } from "./audio.js";

const BPM = 120;
const STEP = 60 / BPM / 4;                 // seconds per step
const SECTION_STEPS = 64;
const VOLUME = 0.5;
const REVERB_AMOUNT = 0.12;                // how much echo of the room is mixed in
const REVERB_SECONDS = 1.2;                // how long the echo lasts

const _ = null;                            // a rest (no new note)

// Chords: [bass note as a MIDI number, "m" for minor or "M" for major].
const Em = [40, "m"], C = [36, "M"], G = [43, "M"], D = [38, "M"], Bm = [35, "m"];

// Melody notes are MIDI numbers (64 = E4, 67 = G4, 71 = B4, 76 = E5, ...).
const SECTIONS = {
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
const ARRANGEMENT = [
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

// The pluck's pattern within each bar: which step it plays on, and which chord note.
const PLUCK_PATTERN = { 0: 0, 3: 1, 6: 2, 10: 1, 12: 3 };
const SONG_STEPS = ARRANGEMENT.length * SECTION_STEPS;

// Turn a MIDI note number into a frequency in Hz.
function noteToHz(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

export function createMusic() {
  let audio = null;        // the browser's audio system (see audio.js); ready after the first click or key press
  let master = null;       // overall volume (0 when music is turned off)
  let runVolume = null;    // volume for the current run; faded out to stop the song
  let noise = null;        // random noise, used for the drums
  let reverb = null;       // where sounds go to get the "room" echo

  let enabled = true;      // M turns this on and off
  let playing = false;     // is a run going?
  let runStartedAt = 0;    // when the current run started (performance.now() time)
  let step = 0;            // next step of the song to schedule
  let stepTime = 0;        // when that step should play (audio clock time)

  // ---------- Instruments ----------
  // Each one plays a single sound at "time" (on the audio clock).

  // A smooth synth note.
  // - wave: the sound wave's shape ("sawtooth" is bright, "triangle" and "sine" are soft).
  // - detune: plays two copies, one slightly sharp and one slightly flat (in cents,
  //   1/100 of a semitone). They drift in and out of tune with each other, which
  //   sounds wide and rich instead of thin and "pixelated".
  // - cutoff: a filter removes sounds higher than this (in Hz), which softens harsh waves.
  // - attack / release: how many seconds the note takes to fade in, and to fade out.
  function synth(hz, time, length, volume, { wave = "sawtooth", detune = 0, cutoff = 2000, attack = 0.01, release = 0.1 } = {}) {
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    filter.connect(gain).connect(runVolume);

    // Volume shape: fade in, hold, then fade out after the note ends.
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + attack);
    gain.gain.setTargetAtTime(volume * 0.7, time + attack, length / 3);   // settle a little lower
    gain.gain.setTargetAtTime(0, time + length, release / 3);
    const end = time + length + release;

    const copies = detune ? [-detune, detune] : [0];
    for (const cents of copies) {
      const osc = audio.createOscillator();
      osc.type = wave;
      osc.frequency.value = hz;
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(time);
      osc.stop(end);
    }
  }

  // The reverb: a short recording of "echo" made from fading random noise.
  // Running sounds through it makes them sound like they're playing in a room.
  function createReverb() {
    const length = audio.sampleRate * REVERB_SECONDS;
    const echo = audio.createBuffer(2, length, audio.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = echo.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      }
    }
    const convolver = audio.createConvolver();
    convolver.buffer = echo;
    const amount = audio.createGain();
    amount.gain.value = REVERB_AMOUNT;
    amount.connect(convolver).connect(master);
    return amount;
  }

  // A burst of noise. The highpass filter removes low sounds: higher = hissier.
  function hiss(time, length, volume, highpassHz) {
    const src = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    src.buffer = noise;
    filter.type = "highpass";
    filter.frequency.value = highpassHz;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + length);
    src.connect(filter).connect(gain).connect(runVolume);
    src.start(time);
    src.stop(time + length);
  }

  // Kick: a low tone that drops in pitch very fast, which sounds like a thump.
  function kick(time) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain).connect(runVolume);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  function snare(time) {
    hiss(time, 0.15, 0.22, 1800);
    synth(190, time, 0.05, 0.18, { wave: "sine", release: 0.05 });   // a short low tone gives it some body
  }

  function hat(time) {
    hiss(time, 0.04, 0.07, 9000);
  }

  // Clap: three quick bursts of noise very close together, like hands that don't
  // quite clap at the same moment.
  function clap(time) {
    for (const delay of [0, 0.012, 0.024]) hiss(time + delay, 0.12, 0.12, 1200);
  }

  // Shaker: a tiny, quiet tick of very high noise.
  function shaker(time) {
    hiss(time, 0.03, 0.03, 7000);
  }

  // Crash cymbal: a long, bright wash of noise that slowly fades.
  function crash(time) {
    hiss(time, 1.4, 0.1, 5000);
  }

  // The notes of a chord, counted in steps above its bass note.
  function chordShape(chord) {
    return chord[1] === "m" ? [0, 3, 7, 12] : [0, 4, 7, 12];
  }

  // ---------- Playing the song ----------

  // Play everything that happens on one step of the song.
  function playStep(songStep, time) {
    const part = ARRANGEMENT[Math.floor(songStep / SECTION_STEPS)];
    const section = SECTIONS[part.section];
    const local = songStep % SECTION_STEPS;               // step inside the section, 0-63
    const beat = local % 16;                              // step inside the bar, 0-15
    const chord = section.chords[Math.floor(local / 16)];
    const root = chord[0];
    const shape = chordShape(chord);
    const has = (name) => part.play.includes(name);

    // Lead melody: a wide, detuned synth. A note is held longer if a rest comes next.
    if (has("lead") && section.melody) {
      const note = section.melody[local];
      if (note !== null) {
        const held = section.melody[local + 1] === null ? 2 : 1;
        synth(noteToHz(note), time, STEP * held, 0.075,
          { detune: 10, cutoff: 7000, attack: 0.01, release: 0.15 });
      }
    }

    // Pluck: a short, bright counter-melody bouncing between the chord's notes.
    if (has("pluck") && beat in PLUCK_PATTERN) {
      synth(noteToHz(root + 24 + shape[PLUCK_PATTERN[beat]]), time, STEP * 0.5, 0.05,
        { detune: 6, cutoff: 6000, attack: 0.003, release: 0.08 });
    }

    // Arpeggio: the chord's notes one after another, soft and bell-like.
    if (has("arp")) {
      synth(noteToHz(root + 36 + shape[local % 4]), time, STEP * 0.6, 0.05,
        { wave: "triangle", cutoff: 9000, release: 0.1 });
    }

    // Pad: soft, long chords in the background, one per bar.
    if (has("pad") && beat === 0) {
      for (const offset of shape.slice(0, 3)) {
        synth(noteToHz(root + 24 + offset), time, STEP * 15, 0.018,
          { detune: 15, cutoff: 4000, attack: 0.3, release: 0.4 });
      }
    }

    // Stabs: the whole chord, short and punchy, on the off-beats.
    if (has("stab") && beat % 4 === 2) {
      for (const offset of shape.slice(0, 3)) {
        synth(noteToHz(root + 24 + offset), time, STEP * 0.8, 0.03,
          { detune: 12, cutoff: 5000, release: 0.1 });
      }
    }

    // Bass on every other step, switching between a low and a high octave:
    // a round sine wave underneath, plus a filtered sawtooth for a little growl.
    if (has("bass") && local % 2 === 0) {
      const octave = local % 4 === 0 ? 0 : 12;
      const hz = noteToHz(root + octave);
      synth(hz, time, STEP * 1.5, 0.3, { wave: "sine", release: 0.06 });
      synth(hz, time, STEP * 1.5, 0.08, { cutoff: 1000, release: 0.06 });
    }

    // Drums: kick on every beat, snare on beats 2 and 4, hi-hat on the off-beats.
    if (has("kick") && beat % 4 === 0) kick(time);
    if (has("snare") && (beat === 4 || beat === 12)) snare(time);
    if (has("hat") && beat % 4 === 2) hat(time);
    if (has("clap") && (beat === 4 || beat === 12)) clap(time);
    if (has("shaker") && beat % 2 === 1) shaker(time);
    if (has("crash") && local === 0) crash(time);   // at the start of the section
  }

  // Runs every 25 ms and queues up the notes due in the next 0.1 seconds.
  // Planning slightly ahead keeps the rhythm steady even if the game has a slow frame.
  function schedule() {
    if (!playing) return;
    while (stepTime < audio.currentTime + 0.1) {
      playStep(step % SONG_STEPS, stepTime);
      step++;
      stepTime += STEP;
    }
  }

  // Start the song from "offset" seconds in, with a fresh volume control for this run.
  function begin(offset) {
    runVolume = audio.createGain();
    runVolume.connect(master);
    runVolume.connect(reverb);
    step = Math.ceil(offset / STEP);
    stepTime = audio.currentTime + 0.05 + (step * STEP - offset);
  }

  // Once sound is allowed (after the first click or key press), set up the
  // instruments and join the song where the run is now.
  onAudioReady((readyAudio) => {
    audio = readyAudio;
    noise = getNoise();
    master = audio.createGain();
    master.gain.value = enabled ? VOLUME : 0;
    master.connect(audio.destination);
    reverb = createReverb();

    if (playing) begin((performance.now() - runStartedAt) / 1000);
    setInterval(schedule, 25);
  });

  // ---------- Controls for the game ----------

  // A run started: play the song from the beginning.
  function start() {
    playing = true;
    runStartedAt = performance.now();
    if (audio) begin(0);
  }

  // The run ended (crash or finish): quickly fade out the song.
  function stop() {
    playing = false;
    if (!runVolume) return;
    const fading = runVolume;
    fading.gain.setTargetAtTime(0, audio.currentTime, 0.03);
    setTimeout(() => fading.disconnect(), 300);
    runVolume = null;
  }

  // Turn the music on or off (the M key).
  function toggle() {
    enabled = !enabled;
    if (master) master.gain.value = enabled ? VOLUME : 0;
  }

  return { start, stop, toggle };
}
