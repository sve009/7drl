import { Entity } from "./entity"
import { Display } from "rot-js";

export class GameState {
  running: boolean;
  map: GameMap;
  entities: Entity[];

  constructor() {
    this.running = false;
    this.map = new GameMap(80, 40);
    this.entities = [];
  }
}

export class GameMap {
  width: number;
  height: number;
  tiles: Tile[];
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    for (let i = 0; i < width * height; i++) {
      let tile = new Tile(0);
      this.tiles.push(tile);
    }
  }

  setTile(x: number, y: number, value: number) {
    let tile = new Tile(value);
    this.tiles[x + this.width*y] = tile;
  }

  draw(display: Display) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        let tile = this.tiles[j + i*this.width];
        display.draw(j, i, tile.getSymbol(), "#fff", "#000");
      }
    }
  }
}

class Tile {
  layers: Map<string, number>;

  constructor(terrainLayer: number) {
    this.layers = new Map();
    this.layers.set("TERRAIN", terrainLayer); 
  }

  passable(): boolean {
    return this.layers.get("TERRAIN") != 0;
  }

  getSymbol(): string {
    switch (this.layers.get("TERRAIN")) {
      case 0: {
        return "#";
      }
      case 1: {
        return ".";
      }
    }
  }
}
