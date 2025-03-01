import { Entity } from "./Entity"

export class GameState {
  map: GameMap;
  entities: [Entity];
}

export class GameMap {
  constructor() {}
}

class Tile {
  layers: Map<string, number>;

  constructor(terrainLayer: number) {
    this.layers.set("TERRAIN", terrainLayer); 
  }

  passable(): boolean {
    return this.layers.get('TERRAIN') != 0;
  }
}
