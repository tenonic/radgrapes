// Player controls: Space, Up arrow, W, a mouse click or a screen tap asks for a jump.
// The game asks "was jump pressed?" once per frame with consumeJump().

const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];

export function createInput() {
  let jumpPressed = false;

  window.addEventListener("keydown", (event) => {
    if (!JUMP_KEYS.includes(event.code)) return;
    event.preventDefault();               // stop Space from scrolling the page
    if (!event.repeat) jumpPressed = true; // ignore the repeats from holding a key down
  });

  // "pointerdown" covers both mouse clicks and screen taps.
  window.addEventListener("pointerdown", () => {
    jumpPressed = true;
  });

  // Returns true once per press, then resets, so one press = one jump.
  function consumeJump() {
    const pressed = jumpPressed;
    jumpPressed = false;
    return pressed;
  }

  return { consumeJump };
}
