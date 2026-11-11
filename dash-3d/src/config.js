// Settings shared by the whole game. Per-map settings (like speed) live in src/maps/.

// After hitting an obstacle, everything stops for this many seconds, then the run restarts.
export const CRASH_PAUSE = 1;

// Height of the ceiling in ship and spider sections.
// The ship can't fly above it, and the spider runs along it upside down.
export const CEILING_HEIGHT = 5;

// After crossing the finish line, everything stops for this many seconds, then the map starts again.
export const FINISH_PAUSE = 2;
