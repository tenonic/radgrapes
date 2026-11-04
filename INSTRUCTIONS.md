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

### Layout
- The castle is a pixel-art picture (castle.png, about 150x200) on the right edge of the screen, centered vertically.
- The player starts just in front of (left of) the castle and can move anywhere on screen except through the castle, including the gaps above and below it.
- Everything else is drawn with simple shapes.

### Controls
- Move with the arrow keys or WASD.
- Aim with the mouse and click to fire toward the mouse pointer.

### Aliens
- Aliens spawn on the left edge at random heights (y positions), about one per second, and fly toward the castle at a steady speed (at an angle, so they can't slip past above or below it).
- Shooting an alien: score +1.
- An alien touching the castle: lives -2 and the screen shakes.
- An alien touching the player: lives -1.

### Boss
- After 20 aliens are killed, a big UFO boss appears on the left edge. Regular aliens stop spawning.
- The boss slides up and down and has 30 lives, shown in a health bar.
- It fires a laser toward the right about every 1500 ms.
- The player can shoot lasers to destroy them (one shot per laser).
- A laser touching the player: lives -2.
- A laser touching the castle: lives -5.
- When the boss's lives reach 0, it explodes, and 1500 ms later the player wins.

### Lives and ending
- The player starts with 10 lives. At 0 lives, the player loses.
- On win or lose, show "You Win" or "Game Over". Press a key to restart.

