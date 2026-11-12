// Music: plays a map's original song, made in code with the browser's Web Audio API
// (no music file). Smooth modern synths (detuned, filtered waves) with a bit of reverb,
// rather than retro "chiptune" square waves. The songs themselves are in src/songs/.
//
// The song is tied to the run: it starts from the beginning when a run starts, and
// stops when the player crashes or finishes. So the same part of the song always
// plays at the same place in the map.
//
// How a song is written (see src/songs/song1.js):
// - A "step" is a 16th note. At 120 beats per minute, one step is 0.125 seconds.
// - A "section" is 4 bars (64 steps), with one chord per bar and (optionally) a melody.
// - The arrangement lists the sections in order and which instruments play in each.
//   After the last one, the song loops.

import { onAudioReady, getNoise } from "./audio.js";

const SECTION_STEPS = 64;                  // 4 bars of 16 steps
const VOLUME = 0.5;
const REVERB_AMOUNT = 0.12;                // how much echo of the room is mixed in
const REVERB_SECONDS = 1.2;                // how long the echo lasts

// Turn a MIDI note number into a frequency in Hz.
function noteToHz(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// The pluck's pattern within each bar: which step it plays on, and which chord note.
const PLUCK_PATTERN = { 0: 0, 3: 1, 6: 2, 10: 1, 12: 3 };

// How each instrument sounds: its volume and synth settings (see synth() below).
// A song can change any of these with its "style" (see src/songs/song2.js).
const DEFAULT_SOUNDS = {
  lead:  { volume: 0.075, detune: 10, cutoff: 7000, attack: 0.01, release: 0.15 },
  pluck: { volume: 0.05, detune: 6, cutoff: 6000, attack: 0.003, release: 0.08 },
  arp:   { volume: 0.05, wave: "triangle", cutoff: 9000, release: 0.1 },
  pad:   { volume: 0.018, detune: 15, cutoff: 4000, attack: 0.3, release: 0.4 },
  stab:  { volume: 0.03, detune: 12, cutoff: 5000, release: 0.1 },
  growl: { volume: 0.08, cutoff: 1000, release: 0.06 }   // the sawtooth layer of the bass
};

// The drum patterns within each bar, one character per step: "x" = hit, "." = nothing.
// A song can change any of these with its "style".
const DEFAULT_DRUMS = {
  kick:   "x...x...x...x...",   // every beat
  snare:  "....x.......x...",   // beats 2 and 4
  clap:   "....x.......x...",
  hat:    "..x...x...x...x.",   // the off-beats
  shaker: ".x.x.x.x.x.x.x.x"
};

// song: one of the songs in src/songs/ ({ bpm, sections, arrangement, style }).
// An arrangement entry can have "transpose": move that section up this many semitones.
//
// A song can also be a medley of parts, each with its own speed and sound:
// { parts: [song, song, ...], loop: false }. With loop: false the song plays once,
// to the end, and then stays silent instead of starting over.
//
// style (optional) changes how the song (or part) sounds:
// - reverb: how much room echo (default 0.12).
// - pump: true makes the synths duck on every kick and swell back ("sidechain"),
//   the pumping sound of dance music.
// - sounds: changes to DEFAULT_SOUNDS, per instrument.
// - drums: changes to DEFAULT_DRUMS, per drum.
// - hardKick: a heavier, distorted kick with a longer, booming tail.
// - distortion: 0 to 1, how much the synths are overdriven (a rough, gritty sound).
// - bassEvery: the bass plays every this many steps (default 2; 1 = a rolling bass).
// - arpOctave: how far above the chord the arpeggio plays, in semitones (default 36;
//   48 = an octave higher, like a tiny music box).
// Chords can be "m" (minor), "M" (major), "d" (diminished: tense) or "x" (a cluster with
// the note right above the root: harsh and creepy).
// Two extra instruments can be listed in a section's "play":
// - "roll": a snare roll that speeds up through the section's last bar.
// - "riser": a rising rush of noise over the whole section, leading into the next one.
// Work out a part's full settings from its style and the defaults.
function partSettings(part) {
  const style = part.style ?? {};
  const sounds = {};
  for (const [name, settings] of Object.entries(DEFAULT_SOUNDS)) {
    sounds[name] = { ...settings, ...style.sounds?.[name] };
  }
  return {
    step: 60 / part.bpm / 4,                  // seconds per step
    sounds,
    drums: { ...DEFAULT_DRUMS, ...style.drums },
    bassEvery: style.bassEvery ?? 2,
    pump: style.pump ?? false,
    hardKick: style.hardKick ?? false,
    distortion: style.distortion ?? 0,
    reverb: style.reverb ?? REVERB_AMOUNT,
    arpOctave: style.arpOctave ?? 36
  };
}

// The whole song as a list of sections in order, each with its start time (in seconds),
// its part's settings, and what plays in it. Returns { sections, length }.
// (Exported so the flashing lights can follow the beat.)
export function buildTimeline(parts) {
  const sections = [];
  let time = 0;
  for (const part of parts) {
    const settings = partSettings(part);
    for (const entry of part.arrangement) {
      sections.push({
        start: time,
        settings,
        section: part.sections[entry.section],
        play: entry.play,
        transpose: entry.transpose ?? 0
      });
      time += settings.step * SECTION_STEPS;
    }
  }
  return { sections, length: time };
}

export function createMusic(song) {
  const parts = song.parts ?? [song];
  const TIMELINE = buildTimeline(parts);
  const LOOP = song.loop !== false;

  // The settings of the section playing right now (set at every step).
  let current = TIMELINE.sections[0].settings;

  // Play an instrument's note with the current part's settings for it.
  const play = (name, hz, time, length) => {
    const { volume, ...options } = current.sounds[name];
    synth(hz, time, length, volume, options);
  };

  let audio = null;        // the browser's audio system (see audio.js); ready after the first click or key press
  let master = null;       // overall volume (0 when music is turned off)
  let runVolume = null;    // volume for the current run; faded out to stop the song
  let synthVolume = null;  // the synths' volume, which "pumps" with the kick if the song asks
  let distorted = {};      // distortion units for this run, by amount (see distortionInput())
  let noise = null;        // random noise, used for the drums
  let reverb = null;       // where sounds go to get the "room" echo

  let enabled = true;      // M turns this on and off
  let playing = false;     // is a run going?
  let runStartedAt = 0;    // when the current run started (performance.now() time)
  let sectionIndex = 0;    // which section of the timeline the next step is in
  let step = 0;            // next step to schedule, inside that section (0-63)
  let stepTime = 0;        // when that step should play (audio clock time)

  // ---------- Instruments ----------
  // Each one plays a single sound at "time" (on the audio clock).

  // A smooth synth note.
  // - wave: the sound wave's shape ("sawtooth" is bright, "triangle" and "sine" are soft).
  // - detune: plays two copies, one slightly sharp and one slightly flat (in cents,
  //   1/100 of a semitone). They drift in and out of tune with each other, which
  //   sounds wide and rich instead of thin and "pixelated".
  // - voices: how many copies, spread evenly between flat and sharp (default 2).
  //   Many voices make a huge "supersaw" sound.
  // - cutoff: a filter removes sounds higher than this (in Hz), which softens harsh waves.
  // - attack / release: how many seconds the note takes to fade in, and to fade out.
  function synth(hz, time, length, volume, { wave = "sawtooth", detune = 0, voices = 2, cutoff = 2000, attack = 0.01, release = 0.1 } = {}) {
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    filter.connect(gain).connect(current.distortion ? distortionInput(current.distortion) : synthVolume);

    // Volume shape: fade in, hold, then fade out after the note ends.
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + attack);
    gain.gain.setTargetAtTime(volume * 0.7, time + attack, length / 3);   // settle a little lower
    gain.gain.setTargetAtTime(0, time + length, release / 3);
    const end = time + length + release;

    const copies = detune
      ? Array.from({ length: voices }, (_, i) => -detune + (2 * detune * i) / (voices - 1))
      : [0];
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
    amount.gain.value = TIMELINE.sections[0].settings.reverb;   // each part can change it
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
  // The hard kick starts higher, booms longer, and goes through distortion.
  function kick(time) {
    const hard = current.hardKick;
    const length = hard ? 0.35 : 0.18;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(hard ? 220 : 140, time);
    osc.frequency.exponentialRampToValueAtTime(hard ? 45 : 40, time + (hard ? 0.09 : 0.12));
    gain.gain.setValueAtTime(hard ? 0.7 : 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + length);
    osc.connect(gain);
    if (hard) gain.connect(createDistortion(0.8)).connect(runVolume);
    else gain.connect(runVolume);
    osc.start(time);
    osc.stop(time + length);

    // Pump: drop the synths' volume right on the kick, then let it swell back up.
    if (current.pump) {
      synthVolume.gain.setValueAtTime(0.25, time);
      synthVolume.gain.setTargetAtTime(1, time + 0.02, 0.06);
    }
  }

  // Distortion: squashes the sound wave's peaks flat, which adds a rough, gritty edge.
  // amount: 0 (clean) to 1 (very rough).
  function createDistortion(amount) {
    const shaper = audio.createWaveShaper();
    const curve = new Float32Array(1024);
    const k = amount * 50;
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    shaper.curve = curve;
    return shaper;
  }

  // Riser: noise that sweeps up in pitch and gets louder over "length" seconds.
  function riser(time, length) {
    const src = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    src.buffer = noise;
    src.loop = true;
    filter.type = "bandpass";
    filter.Q.value = 3;
    filter.frequency.setValueAtTime(300, time);
    filter.frequency.exponentialRampToValueAtTime(9000, time + length);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.25, time + length);
    gain.gain.setValueAtTime(0, time + length);
    src.connect(filter).connect(gain).connect(runVolume);
    src.start(time);
    src.stop(time + length);
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
  const CHORD_SHAPES = { m: [0, 3, 7, 12], M: [0, 4, 7, 12], d: [0, 3, 6, 12], x: [0, 1, 7, 12] };
  function chordShape(chord) {
    return CHORD_SHAPES[chord[1]];
  }

  // ---------- Playing the song ----------

  // Where the synths go to be distorted: one distortion unit per amount, shared by every
  // note, then turned down a bit (distortion makes things louder), then into synthVolume.
  function distortionInput(amount) {
    if (!distorted[amount]) {
      const shaper = createDistortion(amount);
      const after = audio.createGain();
      after.gain.value = 0.6;
      shaper.connect(after).connect(synthVolume);
      distorted[amount] = shaper;
    }
    return distorted[amount];
  }

  // Play everything that happens on one step of a section.
  // part: the timeline entry. local: the step inside the section, 0-63.
  function playStep(part, local, time) {
    current = part.settings;
    const { step: STEP, drums: DRUMS, bassEvery: BASS_EVERY } = current;
    const section = part.section;
    const beat = local % 16;                              // step inside the bar, 0-15
    const chord = section.chords[Math.floor(local / 16)];
    const root = chord[0] + part.transpose;
    const shape = chordShape(chord);
    const has = (name) => part.play.includes(name);

    // Each part can have its own amount of echo.
    if (local === 0) reverb.gain.setValueAtTime(current.reverb, time);

    // Lead melody: a wide, detuned synth. A note is held longer if a rest comes next.
    if (has("lead") && section.melody) {
      const note = section.melody[local];
      if (note !== null) {
        const held = section.melody[local + 1] === null ? 2 : 1;
        play("lead", noteToHz(note + part.transpose), time, STEP * held);
      }
    }

    // Pluck: a short, bright counter-melody bouncing between the chord's notes.
    if (has("pluck") && beat in PLUCK_PATTERN) {
      play("pluck", noteToHz(root + 24 + shape[PLUCK_PATTERN[beat]]), time, STEP * 0.5);
    }

    // Arpeggio: the chord's notes one after another, soft and bell-like.
    if (has("arp")) {
      play("arp", noteToHz(root + current.arpOctave + shape[local % 4]), time, STEP * 0.6);
    }

    // Pad: soft, long chords in the background, one per bar.
    if (has("pad") && beat === 0) {
      for (const offset of shape.slice(0, 3)) {
        play("pad", noteToHz(root + 24 + offset), time, STEP * 15);
      }
    }

    // Stabs: the whole chord, short and punchy, on the off-beats.
    if (has("stab") && beat % 4 === 2) {
      for (const offset of shape.slice(0, 3)) {
        play("stab", noteToHz(root + 24 + offset), time, STEP * 0.8);
      }
    }

    // Bass every BASS_EVERY steps, switching between a low and a high octave:
    // a round sine wave underneath, plus a filtered sawtooth for a little growl.
    if (has("bass") && local % BASS_EVERY === 0) {
      const octave = (local / BASS_EVERY) % 2 === 0 ? 0 : 12;
      const hz = noteToHz(root + octave);
      const length = STEP * BASS_EVERY * 0.75;
      synth(hz, time, length, 0.3, { wave: "sine", release: 0.06 });
      play("growl", hz, time, length);
    }

    // Drums, from the patterns in DRUMS.
    const hits = (drum) => has(drum) && DRUMS[drum][beat] === "x";
    if (hits("kick")) kick(time);
    if (hits("snare")) snare(time);
    if (hits("hat")) hat(time);
    if (hits("clap")) clap(time);
    if (hits("shaker")) shaker(time);
    if (has("crash") && local === 0) crash(time);   // at the start of the section

    // Snare roll through the last bar: every 4 steps, then every 2, then every step.
    if (has("roll") && local >= 48) {
      const every = local < 52 ? 4 : local < 56 ? 2 : 1;
      if (local % every === 0) snare(time);
    }
    if (has("riser") && local === 0) riser(time, STEP * SECTION_STEPS);
  }

  // Runs every 25 ms and queues up the notes due in the next 0.1 seconds.
  // Planning slightly ahead keeps the rhythm steady even if the game has a slow frame.
  function schedule() {
    if (!playing) return;
    while (stepTime < audio.currentTime + 0.1) {
      if (sectionIndex >= TIMELINE.sections.length) {
        if (!LOOP) return;                // the song is over: stay silent
        sectionIndex = 0;                 // start the song over
      }
      const part = TIMELINE.sections[sectionIndex];
      playStep(part, step, stepTime);
      stepTime += part.settings.step;
      step++;
      if (step === SECTION_STEPS) {
        step = 0;
        sectionIndex++;
      }
    }
  }

  // Start the song from "offset" seconds in, with a fresh volume control for this run.
  function begin(offset) {
    runVolume = audio.createGain();
    runVolume.connect(master);
    runVolume.connect(reverb);
    synthVolume = audio.createGain();
    synthVolume.connect(runVolume);
    distorted = {};

    // Find the section playing at "offset", and the next step in it.
    if (LOOP) offset %= TIMELINE.length;
    sectionIndex = TIMELINE.sections.findIndex(
      (part) => offset < part.start + part.settings.step * SECTION_STEPS
    );
    if (sectionIndex === -1) {           // past the end of a song that doesn't loop
      sectionIndex = TIMELINE.sections.length;
      return;
    }
    const part = TIMELINE.sections[sectionIndex];
    step = Math.ceil((offset - part.start) / part.settings.step);
    stepTime = audio.currentTime + 0.05 + (part.start + step * part.settings.step - offset);
    if (step >= SECTION_STEPS) {
      step = 0;
      sectionIndex++;
    }
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
