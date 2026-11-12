// Every level in the game, in the order shown on the level selection screen.
// "load" brings in the map only when it's picked, so the menu shows up fast.
// A level without "load" is shown as "Coming soon" and can't be picked yet.
export const LEVELS = [
  { name: "Map 1", difficulty: "Harder", load: () => import("./map1.js") },
  { name: "Map 2", difficulty: "Insane", load: () => import("./map2.js") },
  { name: "Map 3", difficulty: "Demon", load: () => import("./map3.js") },
  { name: "Map 4", difficulty: "???", load: () => import("./map4.js") }
];
