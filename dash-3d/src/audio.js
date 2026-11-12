// The browser's audio system, shared by the music and the sound effects.
// Browsers only allow sound after the player clicks or presses a key, so it's
// created on the first one. Anything that needs it asks with onAudioReady().
const readyCallbacks = [];
let audio = null;
let noise = null;

function unlock() {
  if (audio) return;
  audio = new AudioContext();

  // 1.5 seconds of random noise, used for drums and the crash sound.
  noise = audio.createBuffer(1, audio.sampleRate * 1.5, audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  readyCallbacks.forEach((callback) => callback(audio));
}
window.addEventListener("pointerdown", unlock);
window.addEventListener("keydown", unlock);

// When the tab is hidden the game freezes, so pause the sound too, to stay in sync.
document.addEventListener("visibilitychange", () => {
  if (!audio) return;
  if (document.hidden) audio.suspend();
  else audio.resume();
});

// Run "callback(audio)" once sound is allowed (right away, if it already is).
export function onAudioReady(callback) {
  if (audio) callback(audio);
  else readyCallbacks.push(callback);
}

// The audio system, or null if the player hasn't clicked or pressed a key yet.
export function getAudio() {
  return audio;
}

// The shared random noise buffer.
export function getNoise() {
  return noise;
}
