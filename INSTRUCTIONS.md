# Game Instructions

Instructions for the game, recorded in the order they were given.

## Instructions

1. Small incremental steps.
2. Explain what you did. The user wants to learn.
3. Always confirm with the user before making changes and before pushing to git.
4. Make a new git branch for big changes.
5. Always ask if something isn't clear, and recommend best practices when there's a suggestion to make.
6. Keep the game simple. Warn the user if it starts getting complicated.

## Game design

Defend a castle from aliens.

### Look
- Everything is 8-bit pixel style: pixel sprites, a pixel font (Press Start 2P), a starry background, and chunky effects.
- The castle is a pixel-art picture (castle.png, about 150x200). It sits on the right edge of the screen, on top of a small Mars hill.
- The hill is rusty red, built as 3 stepped tiers, and is solid like the castle.
- The player has a jetpack with a flickering flame and faces left, toward the aliens.

### Layout and movement
- The player starts just in front of (left of) the castle.
- The player can fly anywhere on screen except through the castle or the hill, including the gap above the castle.

### Controls
- Move with the arrow keys or WASD.
- Aim with the mouse and click to fire toward the mouse pointer.
- Press M to turn the music on or off.

### Aliens
- Aliens spawn on the left edge at random heights (y positions), about one per second.
- They fly toward the castle at a steady speed, at an angle so they can't slip past it. They aim a little above the castle's base so they don't clip the hill.
- Shooting an alien: score +1.
- An alien touching the castle: lives -2 and the screen shakes.
- An alien touching the player: lives -1.
- Aliens already on screen when the boss arrives keep coming until they're shot or reach the castle.

### Boss
- After 30 aliens are killed, a big UFO boss slides in from the left edge. Regular aliens stop spawning.
- The boss slides up and down and has 30 lives, shown in a segmented health bar (one block per life).
- It fires a thick laser about every 1500 ms, aimed at the castle.
- The player can shoot lasers to destroy them (one shot per laser).
- A laser touching the player: lives -2.
- A laser touching the castle: lives -5 and the screen shakes.
- When the boss's lives reach 0, it explodes into pixel bits with a short screen shake, and 1500 ms later the player wins.

### Lives and ending
- The player starts with 30 lives. At 0 lives, the player loses.
- On win or lose, show "YOU WIN!" or "GAME OVER". Press any key to restart.

### Music
- An original 8-bit soundtrack, generated in code with the Web Audio API (no music file).
- It's about 1.5 minutes long before it loops, built from reusable 4-bar sections in a set order.
- Seven instruments: lead, lead double, arpeggio, bass, kick, snare, and hi-hat.
- The music starts on the first click or key press, because browsers block sound until then.
- It speeds up from 150 to 180 BPM during the boss fight.
- No copyrighted music: the user asked for "Rude Buster" by Toby Fox, and an original tune was used instead.
