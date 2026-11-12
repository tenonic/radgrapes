// Player controls: Space, Up arrow, W, a mouse click or a screen tap.
// Two ways to read them:
// - consumeJump(): was jump pressed since last frame? (one press = one jump, used by the cube)
// - isHeld(): is jump being held down right now? (used by the ship to fly up)
// Other keys can be given their own action with onKeyPress(code, action).

const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];

export function createInput() {
  let jumpPressed = false;
  const keysDown = new Set();   // jump keys currently held
  let pointerDown = false;      // mouse button or finger currently down

  window.addEventListener("keydown", (event) => {
    if (!JUMP_KEYS.includes(event.code)) return;
    event.preventDefault();               // stop Space from scrolling the page
    if (!event.repeat) jumpPressed = true; // ignore the repeats from holding a key down
    keysDown.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    keysDown.delete(event.code);
  });

  // "pointer" events cover both mouse clicks and screen taps.
  window.addEventListener("pointerdown", () => {
    jumpPressed = true;
    pointerDown = true;
  });
  window.addEventListener("pointerup", () => { pointerDown = false; });
  window.addEventListener("pointercancel", () => { pointerDown = false; });

  // If the window loses focus, we never hear about keys being let go, so let go of everything.
  window.addEventListener("blur", () => {
    keysDown.clear();
    pointerDown = false;
  });

  // Returns true once per press, then resets, so one press = one jump.
  function consumeJump() {
    const pressed = jumpPressed;
    jumpPressed = false;
    return pressed;
  }

  function isHeld() {
    return keysDown.size > 0 || pointerDown;
  }

  // Run "action" whenever the key with this code (like "KeyM") is pressed.
  function onKeyPress(code, action) {
    window.addEventListener("keydown", (event) => {
      if (event.code === code && !event.repeat) action();
    });
  }

  return { consumeJump, isHeld, onKeyPress };
}
