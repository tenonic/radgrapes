// The start menu: the game's title and how to play, shown before the first run.
// Its look is in menu.css.

export function createMenu(mapName) {
  const menu = document.createElement("div");
  menu.className = "menu";
  menu.innerHTML = `
    <h1 class="menu-title">Dash 3D</h1>
    <p class="menu-map"></p>
    <p class="menu-start">Press Space or click to start</p>
    <ul class="menu-controls">
      <li><b>Space</b>, <b>W</b>, <b>Up</b> or <b>click</b>: jump</li>
      <li><b>M</b>: music on or off</li>
    </ul>
  `;
  menu.querySelector(".menu-map").textContent = mapName;
  document.body.appendChild(menu);

  function hide() {
    menu.classList.add("hidden");
  }

  return { hide };
}
