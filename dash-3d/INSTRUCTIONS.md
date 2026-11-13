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
- Level selection screen (`src/menu.js`, list of levels in `src/maps/levels.js`): one card per level with its name, difficulty and best %. Click a card or press its number key to play. Esc goes back to the level selection.
- Map 1 is rated **Harder**.
- Map 2 is rated **Insane**. The user asked for the song "Rakuichi Buster" from Deltarune chapter 5; it can't be used (someone else's music), so Map 2 gets its own original song in a similar fast, intense style instead (the user agreed).
- Map 2 (`src/maps/map2.js`): about 3 minutes, same speed (10) so the jump rules still hold. The first 25 seconds are hand-made; the rest uses the level generator's "insane" profile: less room between obstacles, triples from the start, shorter cube parts and more ship, spider and UFO sections. Crimson color theme.
- Each map has its own song (`src/songs/`). Song 2 is an original, fast song in D minor at 150 beats per minute.
- Song 2 sounds more instant and electronic: it starts at full power (no slow intro), notes start and stop sharply, buzzy square-wave leads, little echo, and the synths pump with the kick. A song can change its sound with a "style" (see `src/music.js`).
- Map 3 is rated **Demon** (`src/maps/map3.js`, red glowing label). About 2.7 minutes, same speed (10). Its special part is the ship's "2-gap" tunnel: spikes on a low block below and spikes hanging from the ceiling above, with only 2 units between the tips, so the ship has to fly straight and level.
- The ship tunnel now has 1 more unit of room: a "3-gap" tunnel. The spikes below stand on the road (no block), so there are 3 units between the tips. Spikes can now stand on a block: `{ type: "spike", at, height }`. The first 30 seconds are hand-made (with two tunnels); the rest uses the generator's "demon" profile (even less room, many triples, tunnels in ship sections). Black color theme.
- Song 3 remade to sound very different from Song 2 and much more intense: 180 beats per minute, a dark scale (E phrygian), a hard distorted kick, hi-hats and a rolling bass on every step, a huge "supersaw" lead, distorted synths, snare rolls and noise risers. The music engine supports these as song "style" options; Songs 1 and 2 sound the same as before.
- Map 3: the first ship portal is now a UFO portal (orange colors), so the first two tunnels are flown with the UFO. The triple spike before it is now a single spike.
- Wave portals (`mode: "wave"`): hold jump to fly diagonally up, let go to fly diagonally down, at 45 degrees. It slides along the road, blocks and the ceiling, and leaves a glowing trail. The model is a small dart with a small hitbox. Wave sections get a ceiling. Pink color theme.
- Map 4 is rated **???** (a glitching label). It's the three maps combined: Map 1's, Map 2's and Map 3's hand-made openings back to back, then a new finale with two wave sections plus cube, spider, ship and UFO. About 3 minutes.
- Song 4 doesn't loop, and it's different until the end: a medley of Song 1, Song 2 and Song 3 (each starting exactly where its map's part starts), then a brand-new finale where no section repeats (repeats are moved to a higher key). It ends on a final chord right at the finish line. Songs can now be made of parts, each with its own speed and sound, and can be set to play once (`loop: false`).
- Correction for Map 4: all the songs are combined into one large song: Songs 1, 2 and 3 in full, one after another, then the new finale (about 5 minutes, no loop). The level is as long as the song (2978 units): Map 1's opening, Map 2's opening, a big ship part that takes up 30% of the level (generated, Insane spacing with 3-gap tunnels), Map 3's opening, a generated Demon cube part, then the finale (which starts with the song's finale).
- Map 4 has dim, flashing lights (`src/lights.js`, `lights: "flashing"` in the map): the world and sky are dim, and flash on every beat of the song, brightest on the first beat of each bar. The flashes follow each part's speed.
- Map 4 changed again (the user's choice): it's now its own level and its own song, not the other maps combined. It keeps the wave, the dim flashing lights, the big ship part (30% of the level) and the song that never loops.
- Map 4 is 1.2576 times harder than Map 3: the generator's "extreme" profile divides all the room between obstacles by 1.2576 (never below a safe minimum, so it stays possible), makes triples 1.2576 times as common and singles 1.2576 times as rare, and makes cube parts 1.2576 times shorter. The generator can now build wave sections too.
- Song 4 is now half horror, half dynamic (about 2.3 minutes, the length of the level). Horror half: eerie music-box bells, wobbly dark pads, a heartbeat kick, diminished and clashing "cluster" chords, lots of echo. Dynamic half: fast (175 beats per minute), driving and pumping. The level's "drop" (a wave portal) happens right where the song turns fast. Each song part can now have its own echo amount and arpeggio height.
- Map 4: the wave parts are replaced with UFO parts (the generated one in the horror half, and the drop). Map 4 now has no wave; the wave mode still exists in the game for later.
- Map 1 shortened by 55%: from 6433 to 2897 units (about 11 minutes down to about 4.8 minutes). The start and the generated layout are the same; it just ends sooner.
- Map 4: the portals, spikes and walls look glitchy (`src/glitch.js`, `glitch: true` in the map). Every now and then, for a split second, they flicker into harsh colors, jump sideways, stretch or blink out, and the spikes get a shifted ghost copy. It only changes how they look: hitboxes don't move.
- The glitches were too bright: they now use dark, muted colors with little glow, and the ghost copy is fainter.
- The glitch colors are now more white: white with a faint tint, still with little glow.
- Map 4: the orbs and jump pads glitch the same way (colors and their glow; their hitboxes don't move), and the floor glitches too, but very faintly (a faint whitish shimmer and a tiny shake).
- The walls' glitch is less faint: it glows brighter than the rest.
- New level **Void Sovereign** (`src/maps/voidSovereign.js`), rated **Extreme Demon** (purple and red glowing label), placed right before "???" in the level list. It's 2 times harder than Map 3: the generator's "void" profile halves the room between obstacles (never below the safe minimum), doubles how often triples appear, halves singles, and halves the cube parts. About 2 minutes.
- Void Sovereign has a new purple color theme ("void") everywhere, and a new background (`src/background.js`): purple and white stars, and far ahead a huge, slowly turning purple ring around a black hole.
- Song 5 (`src/songs/song5.js`): an original, dark and epic electronic song in B minor at 160 beats per minute that keeps climbing to higher keys.
- Void Sovereign's background picture changed (the purple colors stay): the throne of the void. A giant crown with glowing gems floats far ahead and slowly turns, purple crystal shards drift and spin all around, and soft purple clouds glow behind everything.
- Song 5 is now different all the way to the end: it never loops, and no section is played in the same key twice (two new sections were added). It ends on a final note right at the finish line, so the level is now 1140 units (1 minute 54 seconds).
- Fix: Void Sovereign's background picture couldn't be seen: the tall side walls hid it. Now the walls stop being drawn where the fog has already made them sky-colored (84 units ahead), so the crown, shards and clouds show above the horizon. The camera also sees further (320 units) so the far clouds aren't cut off. Nothing else looks different.
- Void Sovereign has no side walls (`walls: false` in the map): the walls filled the sides of the view, so the background still didn't show. Now the road floats in the open void, with the crown, clouds and crystal shards all around it. The shards float beside, above and below the road, drifting slowly past.
- The ceiling in ship, spider, UFO (and wave) sections is now 100% invisible, on every level. It still works the same: the ship, UFO and wave can't go above it, and the spider still runs along it.
- Changed back: the ceilings are visible again.
- Song 5 sounds more "void-ish": a huge echo that rings for 3.5 seconds, a deep slow sub bass, wide ghostly pads that swell in slowly, a soft hollow lead, a twinkling music-box arpeggio, half-time sparse drums with lots of empty space, and only a touch of distortion. The melodies, the key changes and the timing (ending at the finish line) are the same. Songs can now set how long their echo rings (`reverbSeconds`).
- Song 5 made more dynamic and electronic, keeping the void feel: driving drums (kick on every beat, hi-hats on every step), a fast rolling bass, a huge supersaw lead, buzzy square-wave arpeggios, pumping and more distortion, with a still-big echo (2.5 seconds) and wide ghostly pads.
- Saws (`src/saws.js`): spinning sawblades. Touching one is a crash. `{ type: "saw", at, height, radius }`: height 0 means half-buried in the road. The blade faces the camera; the hitbox is a little smaller than the blade and doesn't spin. The generator can add saws (`saws: true` in a profile): single saws, pairs of saws, a small saw on top of a low block, and big floating saws in ship and UFO sections.
- New level **Cyber Gridlock** (`src/maps/cyberGridlock.js`), rated **Hard Demon** (orange glowing label), placed between Map 3 and Void Sovereign. 1.5 times harder than Map 3 ("hardDemon" profile), full of saws. About 1 minute 43 seconds.
- Cyber Gridlock looks like a neon cyber grid (`src/grid.js`, `grid: true` in the map): the road and walls are dark with glowing cyan grid lines, and the blocks are magenta ("cyber" theme).
- Song 6 (`src/songs/song6.js`): an original cyber electronic song in F minor at 140 beats per minute: buzzy square-wave lead and arpeggios, punchy drums, pumping bass. It never loops, no section is played in the same key twice, and it ends on a final note right at the finish line.
- The user wants Song 6 to sound more like DJ-Nate's "Electrodynamix". That song can't be copied (someone else's music), so Song 6 keeps its own melodies but gets the same kind of sound, energetic electro-house / chiptune: a wobble bass that wah-wahs on every 8th note, crunchy bit-crushed square-wave leads and arpeggios, a pounding kick on every beat with off-beat hi-hats and claps. The music engine now has "wobble" (per instrument) and "crush" (bit-crushing, per song part).
- Song 3 (`src/songs/song3.js`): an original, dark electronic song in C minor at 160 beats per minute, in the same instant, electronic style as Song 2.
- Side walls along both edges of the road, taller than the screen, scrolling with the world. They look like the road: panels in the road's two colors, lined up with the road tiles.

## To do

- Add more portal types (ship, spider and UFO are done).

- Set up auto-reload: install the VS Code "Live Server" extension (by Ritwick Dey), then right-click `index.html` and choose "Open with Live Server". It serves on port 5500, so stop the Python server once it's working.
