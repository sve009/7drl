import { Map }  from "rot-js";
import { GameMap } from "./gamestate";

export function generateLevel(gameMap: GameMap) {
  // Placeholder for now
  let map = new Map.Arena(20, 20);
  map.create((x: number, y: number, wall: number) => {
    if (!wall) {
      gameMap.setTile(x, y, 1);
    }
  });
}
