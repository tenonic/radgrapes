// Flashing lights: for maps with lights: "flashing". The world is dim, and the lights
// (and the sky) flash on every beat of the song, brightest on the first beat of each bar.
// They follow the song's speed, even in a song made of parts with different speeds.
import { buildTimeline } from "./music.js";
import { palette } from "./palette.js";

const DIM_AMBIENT = 0.15;       // normally 0.6
const DIM_SUN = 0.35;           // normally 1.2
const DIM_SKY = 0.45;           // how bright the sky is between flashes (1 = normal)
const FLASH = 1.0;              // how much brighter a beat makes things
const BAR_FLASH = 1.8;          // ...and the first beat of a bar
const FADE_SECONDS = 0.12;      // how fast a flash fades
const SECTION_STEPS = 64;

// lights: { ambient, sun } from scene.js. song: the map's song.
export function createLights(lights, song) {
  const timeline = buildTimeline(song.parts ?? [song]);
  const loops = song.loop !== false;

  // How bright the flash is at "seconds" into the song: 0 (none) up to BAR_FLASH.
  function flashAt(seconds) {
    if (loops) seconds %= timeline.length;
    const part = timeline.sections.find(
      (section) => seconds < section.start + section.settings.step * SECTION_STEPS
    );
    if (!part) return 0;                                    // the song is over
    const beatLength = part.settings.step * 4;
    const intoSection = seconds - part.start;
    const beat = Math.floor(intoSection / beatLength);
    const sinceBeat = intoSection - beat * beatLength;
    const strength = beat % 4 === 0 ? BAR_FLASH : FLASH;
    return strength * Math.exp(-sinceBeat / FADE_SECONDS);
  }

  // seconds: how far into the run. Call it right after the themes set the sky color.
  function update(seconds) {
    const flash = flashAt(seconds);
    lights.ambient.intensity = DIM_AMBIENT + flash * 0.5;
    lights.sun.intensity = DIM_SUN + flash * 0.6;
    palette.sky.multiplyScalar(DIM_SKY + flash * 0.4);
  }

  return { update };
}
