// The HUD (heads-up display): the progress bar, the attempt counter, and big
// messages like "Level complete!", drawn as web page elements over the 3D view.
// Its look is in hud.css.

function createElement(className, parent) {
  const element = document.createElement("div");
  element.className = className;
  parent.appendChild(element);
  return element;
}

export function createHud() {
  const hud = createElement("hud", document.body);

  const progress = createElement("hud-progress", hud);
  const track = createElement("hud-progress-track", progress);
  const fill = createElement("hud-progress-fill", track);
  const percentText = createElement("hud-progress-text", progress);

  const attempt = createElement("hud-attempt", hud);
  const message = createElement("hud-message", hud);

  // fraction: 0 at the start of the map, 1 at the finish line.
  function setProgress(fraction) {
    const percent = Math.floor(Math.min(Math.max(fraction, 0), 1) * 100);
    fill.style.width = `${percent}%`;
    percentText.textContent = `${percent}%`;
  }

  function setAttempt(number) {
    attempt.textContent = `Attempt ${number}`;
  }

  // Show a big message in the middle, with an optional smaller line under it.
  function showMessage(text, smallText = "") {
    message.textContent = text;
    if (smallText) {
      const small = document.createElement("small");
      small.textContent = smallText;
      message.appendChild(small);
    }
    message.classList.add("visible");
  }

  function hideMessage() {
    message.classList.remove("visible");
  }

  return { setProgress, setAttempt, showMessage, hideMessage };
}
