// Ceilings: a roof over the road in ship and spider sections.
// A section starts at a ship or spider portal and ends at the next portal (or the finish).
import * as THREE from "three";
import { CEILING_HEIGHT } from "./config.js";

const MODES_WITH_CEILING = ["ship", "spider"];
const WIDTH = 6;               // as wide as the road
const THICKNESS = 0.2;
const OVERHANG = 2;            // the roof starts a little before the portal and ends a little after
const COLOR = 0x3d1d5c;

export function createCeilings(parent, portals, mapLength) {
  const sorted = [...portals].sort((a, b) => a.at - b.at);

  // Work out where each ceiling section starts and ends.
  const sections = [];
  sorted.forEach((portal, i) => {
    if (!MODES_WITH_CEILING.includes(portal.mode)) return;
    const end = i + 1 < sorted.length ? sorted[i + 1].at : mapLength;
    sections.push({ start: portal.at, end });
  });

  const material = new THREE.MeshStandardMaterial({ color: COLOR });
  for (const { start, end } of sections) {
    const length = end - start + OVERHANG * 2;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, THICKNESS, length), material);
    roof.position.set(0, CEILING_HEIGHT + THICKNESS / 2, -(start - OVERHANG + length / 2));
    parent.add(roof);
  }

  // Is there a ceiling over the player right now?
  // distance: how far along the road the player is.
  function isCeilingAt(distance) {
    return sections.some(({ start, end }) => distance >= start && distance < end);
  }

  return { isCeilingAt };
}
