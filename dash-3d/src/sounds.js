// Sound effects (the music is in music.js).
import { getAudio, getNoise } from "./audio.js";

const CRASH_VOLUME = 0.5;

// Crash: a burst of noise that gets duller as it fades, plus a low thump.
export function playCrash() {
  const audio = getAudio();
  if (!audio) return;   // no sound until the player has clicked or pressed a key
  const now = audio.currentTime;

  // The noise burst. The filter closes over time, so it goes from "kssh" to "fff".
  const noise = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const noiseVolume = audio.createGain();
  noise.buffer = getNoise();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(6000, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);
  noiseVolume.gain.setValueAtTime(CRASH_VOLUME, now);
  noiseVolume.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  noise.connect(filter).connect(noiseVolume).connect(audio.destination);
  noise.start(now);
  noise.stop(now + 0.6);

  // The thump: a low tone that drops in pitch.
  const thump = audio.createOscillator();
  const thumpVolume = audio.createGain();
  thump.frequency.setValueAtTime(120, now);
  thump.frequency.exponentialRampToValueAtTime(35, now + 0.35);
  thumpVolume.gain.setValueAtTime(CRASH_VOLUME, now);
  thumpVolume.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  thump.connect(thumpVolume).connect(audio.destination);
  thump.start(now);
  thump.stop(now + 0.4);
}
