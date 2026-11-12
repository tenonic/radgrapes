// The level selection screen: the game's title, one card per level (name, difficulty,
// best %), and how to play. Click a card, or press its number key, to play it.
// Its look is in menu.css.
import { loadBest } from "./save.js";

export function createMenu(levels) {
  const menu = document.createElement("div");
  menu.className = "menu";
  menu.innerHTML = `
    <h1 class="menu-title">Dash 3D</h1>
    <p class="menu-map">Choose a level</p>
    <div class="menu-levels"></div>
    <ul class="menu-controls">
      <li><b>Space</b>, <b>W</b>, <b>Up</b> or <b>click</b>: jump</li>
      <li><b>M</b>: music on or off</li>
      <li><b>Esc</b>: back to the levels</li>
    </ul>
  `;
  const list = menu.querySelector(".menu-levels");
  document.body.appendChild(menu);

  // Shows the levels and waits for one to be picked. Gives back the picked level.
  function pickLevel() {
    return new Promise((resolve) => {
      const playable = [];

      levels.forEach((level, index) => {
        const card = document.createElement("button");
        card.className = "menu-level";
        card.disabled = !level.load;
        // The CSS class for the difficulty's color ("???" becomes "unknown").
        const difficultyClass = /^\w+$/.test(level.difficulty) ? level.difficulty.toLowerCase() : "unknown";
        card.innerHTML = `
          <span class="menu-level-number">${index + 1}</span>
          <span class="menu-level-name"></span>
          <span class="menu-level-difficulty ${difficultyClass}">${level.difficulty}</span>
          <span class="menu-level-best"></span>
        `;
        card.querySelector(".menu-level-name").textContent = level.name;
        card.querySelector(".menu-level-best").textContent =
          level.load ? `Best ${loadBest(level.name)}%` : "Coming soon";
        list.appendChild(card);
        if (level.load) {
          card.addEventListener("click", () => choose(level));
          playable[index + 1] = level;
        }
      });

      function onKey(event) {
        const level = playable[Number(event.key)];
        if (level) choose(level);
      }
      window.addEventListener("keydown", onKey);

      function choose(level) {
        window.removeEventListener("keydown", onKey);
        menu.classList.add("hidden");
        resolve(level);
      }
    });
  }

  return { pickLevel };
}
