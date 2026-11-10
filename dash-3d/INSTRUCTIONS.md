# Dash 3D Instructions

Instructions for the game, recorded in the order they were given.

## Instructions

1. Don't write code until the user says to.
2. Build incrementally, one step at a time.
3. Split the code into separate files by what they do, so things are easy to find later. Follow best practices.

## Game design

- Main idea: a game similar to Geometry Dash, but in third person, with the camera behind the player.
- Keep it original: similar mechanics, but our own look, levels and music.

## Tech and running

- 3D is drawn with Three.js, loaded from the web (no install).
- Code is split into files in `src/`, one file per job.
- Run it with a local server: `python3 -m http.server` in this folder, then open http://localhost:8000.

## Progress

- Step 1: a cube on a road, camera behind it, road scrolling toward the camera.
