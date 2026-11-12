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
- Step 9: UFO portals (`mode: "ufo"`). Every jump press gives a small boost up, even in mid-air; gravity pulls it down between taps. UFO sections get a ceiling. The model is a flying saucer with the cube in a glass dome. Map 1 now ends with a UFO section (about 72 seconds long).
- New models from the user's pictures: a cartoon rocket-ship, a UFO with a tall glass dome (cube's blue, no lights), and a blocky spider with one forward-facing eye and walking claw legs.
- Music: an original electronic song made in code (Web Audio API, no music file), in `src/music.js`. It starts from the beginning with every run and stops on a crash or at the finish, so the same part always plays at the same place. Different parts for the ship, spider and UFO sections. Press M to turn it on or off. Browsers only allow sound after the first click or key press.
- HUD (`src/hud.js`, `src/hud.css`): a progress bar with a percentage at the top, an attempt counter in the top-left (goes up every time the map restarts), and a "Level complete!" message at the finish (3-second pause).
- Color themes (`src/themes.js`, `src/palette.js`): the map sets a starting theme and lists where colors change: `{ type: "colors", at, theme }`. The sky, road, walls, ceilings and blocks fade into the new theme over about 1 second. Spikes, orbs, portals and the player keep their own colors. Map 1: purple start, teal ship, blue cube, green spider, purple cube, orange UFO, purple finish.
- Crash effect (`src/effects.js`, `src/sounds.js`): the player shatters into pieces, a crash sound plays, and the camera shakes.
- Jump pads (`src/pads.js`): yellow plates that launch the cube about 2.8 units high with no press. Each works once per run. `{ type: "pad", at, height }` (height optional, for a pad on a block).
- Start menu (`src/menu.js`, `src/menu.css`): title, map name and controls. The first press starts the game.
- Best progress: the best % on each map is saved in the browser and shown under the progress bar, with a marker on the bar (`src/save.js`).
- `src/audio.js` sets up the browser's sound system once, for both the music and the sound effects.
- Map 1 is 10 times longer (about 12 minutes). The first 72 seconds are hand-made; the rest is built by the level generator (`src/maps/generate.js`) from tested patterns, with a fixed seed so it's the same every attempt. It gets harder as it goes (smaller gaps, more triples). Spikes share one shape and material, the road is instanced, and only nearby spikes are checked for hits, so the long map stays fast.
- Map 1 made 10% shorter (about 6435 units, about 11 minutes).
- The cube spins forward while in the air, like Geometry Dash: a normal jump is exactly a half turn (180°). On landing it snaps to the nearest flat side.
- Side walls along both edges of the road, taller than the screen, scrolling with the world. They look like the road: panels in the road's two colors, lined up with the road tiles.

## To do

- Add more portal types (ship, spider and UFO are done).

- Set up auto-reload: install the VS Code "Live Server" extension (by Ritwick Dey), then right-click `index.html` and choose "Open with Live Server". It serves on port 5500, so stop the Python server once it's working.
