// Color themes, and switching between them as the player moves along the map.
// The map lists where the colors change: { type: "colors", at, theme }.
// Passing one fades the sky, road, walls, ceilings and blocks into the new theme.
import * as THREE from "three";
import { palette } from "./palette.js";

// Each theme: sky, the two road shades (lighter first), and the raised-block color.
const THEMES = {
  purple: { sky: 0x1a0b2e, road: [0x5a2d82, 0x3d1d5c], block: 0x8a4fd1 },
  teal:   { sky: 0x0b262e, road: [0x2d7482, 0x1d515c], block: 0x4fc0d1 },
  blue:   { sky: 0x0b142e, road: [0x2d4a82, 0x1d335c], block: 0x4f7fd1 },
  green:  { sky: 0x0b2e18, road: [0x2d824e, 0x1d5c35], block: 0x4fd17f },
  orange: { sky: 0x2e180b, road: [0x82522d, 0x5c381d], block: 0xd1884f },
  crimson: { sky: 0x2e0b12, road: [0x822d3e, 0x5c1d2a], block: 0xd14f68 },
  black:  { sky: 0x050508, road: [0x34343f, 0x22222a], block: 0x5c5c70 },
  pink:   { sky: 0x2e0b26, road: [0x822d6e, 0x5c1d4e], block: 0xd14fb0 },
  void:   { sky: 0x1c0540, road: [0x45178a, 0x2c0e5c], block: 0x8d4ff0 }
};

// How much road it takes to fade from one theme to the next (10 units = 1 second at speed 10).
const FADE_DISTANCE = 10;

// Turn a theme's hex numbers into color objects, so they can be blended.
function toColors(theme) {
  return {
    sky: new THREE.Color(theme.sky),
    road: theme.road.map((hex) => new THREE.Color(hex)),
    block: new THREE.Color(theme.block)
  };
}

// startTheme: the theme at the start of the map. changes: the map's "colors" objects.
export function createThemes(startTheme, changes) {
  const sorted = [...changes].sort((a, b) => a.at - b.at)
    .map(({ at, theme }) => ({ at, colors: toColors(THEMES[theme]) }));
  const start = toColors(THEMES[startTheme]);

  // Set the palette for this point on the road. It works out the colors from the
  // distance alone, so restarting the map needs nothing special.
  function update(distance) {
    let previous = start;
    let current = start;
    let changedAt = -Infinity;
    for (const change of sorted) {
      if (distance < change.at) break;
      previous = current;
      current = change.colors;
      changedAt = change.at;
    }

    // 0 right at the change, 1 once the fade is done.
    const blend = Math.min((distance - changedAt) / FADE_DISTANCE, 1);
    palette.sky.lerpColors(previous.sky, current.sky, blend);
    palette.road[0].lerpColors(previous.road[0], current.road[0], blend);
    palette.road[1].lerpColors(previous.road[1], current.road[1], blend);
    palette.block.lerpColors(previous.block, current.block, blend);
  }

  update(0);
  return { update };
}
