# Dash 3D Instructions

Instructions for the game, recorded in the order they were given.

## Instructions

1. Don't write code until the user says to.
2. Build incrementally, one step at a time.
3. Split the code into separate files by what they do, so things are easy to find later. Follow best practices.

## Game design

- Main idea: a game similar to Geometry Dash, but in third person, with the camera behind the player.
- Keep it original: similar mechanics, but our own look, levels and music.
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

## To do

- Set up auto-reload: install the VS Code "Live Server" extension (by Ritwick Dey), then right-click `index.html` and choose "Open with Live Server". It serves on port 5500, so stop the Python server once it's working.
