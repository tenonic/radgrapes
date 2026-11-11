# Dash 3D Instructions

Instructions for the game, recorded in the order they were given.

## Instructions

1. Don't write code until the user says to.
2. Build incrementally, one step at a time.
3. Split the code into separate files by what they do, so things are easy to find later. Follow best practices.

## Game design

- Main idea: a game similar to Geometry Dash, but in third person, with the camera behind the player.
- Keep it original: similar mechanics, but our own look, levels and music.
- At the normal speed (10), one jump clears at most 3 spikes in a row, never 4.
- Maps mix spike groups in an unpredictable order: singles, two-in-a-row and three-in-a-row, with uneven gaps.
- A map is a fixed level the player repeats after failing. It describes the length of the road, where the road is raised, the road's speed, and the obstacles.

## Tech and running

- 3D is drawn with Three.js, loaded from the web (no install).
- Code is split into files in `src/`, one file per job.
- Run it with a local server: `python3 -m http.server` in this folder, then open http://localhost:8000.

## Progress

- Step 1: a cube on a road, camera behind it, road scrolling toward the camera.
- Step 2: jumping with Space, Up arrow, W, click or tap. Gravity brings the cube back down. No mid-air jumps.
- Step 3: one example obstacle, a spike that keeps coming toward the player. Hitting it restarts the run.
- Hitting an obstacle stops the road and everything else for 1 second, then the run restarts.
- Step 4: the first map (`src/maps/map1.js`) sets the road length, the speed and where the obstacles are. The road ends at a white finish line. Reaching it pauses for 2 seconds, then the map starts again. Raised road sections are not in yet.
- Step 5: jump orbs. A glowing ring floating above the road. Pressing jump while touching it gives a fresh jump, even in mid-air. Same strength as a normal jump. Each orb works once per run and goes dim when used. Orbs are listed in the map as `{ type: "orb", at, height }`.
- Step 6: raised road sections (blocks), as wide as the road. Land on top to run along them; running into the front is a crash. Running off the end drops the cube back down. Listed in the map as `{ type: "block", at, length, height }`.
- Step 7: ship portals. Passing through a portal with `mode: "ship"` turns the cube into a ship; `mode: "cube"` turns it back. The ship flies up while jump is held and drifts down when it's let go. It can't go above a ceiling (height 5), slides along the road, and still crashes into spikes and block fronts. Listed in the map as `{ type: "portal", at, mode }`.
- Step 8: spider portals (`mode: "spider"`). Pressing jump teleports the spider instantly between the road and the ceiling, only while touching one. Ship and spider sections get a visible ceiling at height 5. Spikes can hang from the ceiling: `{ type: "spike", at, onCeiling: true }`.
- Map 1 is now about 1 minute long, with cube, ship and spider sections.

## To do

- Add more portal types (spider is done).

- Set up auto-reload: install the VS Code "Live Server" extension (by Ritwick Dey), then right-click `index.html` and choose "Open with Live Server". It serves on port 5500, so stop the Python server once it's working.
