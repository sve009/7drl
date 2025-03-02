import { Entity } from "./entity"
import { SightMap } from "./fov";
import { Player } from "./player";
import { Glyph, Layer } from "./renderer";

export class GameState {
  running: boolean;
  map: GameMap;
  sightMap: SightMap;
  player?: Player;
  entities: Entity[];

  constructor() {
    this.running = false;
    this.map = new GameMap(80, 40);
    this.sightMap = new SightMap(80, 40, this.map);
    this.entities = [];
  }
}

export class GameMap {
  width: number;
  height: number;
  tiles: Tile[];
  layer: Layer;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    for (let i = 0; i < width * height; i++) {
      let tile = new Tile(0);
      this.tiles.push(tile);
    }
    this.layer = new Layer(0, width, height);
  }

  openSpot(): { x: number; y: number; } {
    for (let i = 0; i < this.width*this.height; i++) {
      let x = i % this.width;
      let y = i // x;
      if (this.passable(x, y)) {
        return { x, y };
      }
    }
  }

  passable(x: number, y: number): boolean {
    return this.tiles[x + this.width*y].passable();
  }

  blocksSight(x: number, y: number): boolean {
    return this.tiles[x + this.width*y].blocksSight();
  }

  setTile(x: number, y: number, value: number) {
    let tile = new Tile(value);
    this.tiles[x + this.width*y] = tile;
  }

  draw(sightMap: SightMap) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (sightMap.isVisible(j, i)) {
          let tile = this.tiles[j + i*this.width];
          this.layer.board[i][j] = new Glyph(tile.getSymbol(), "#fff", "#000");
        }
      }
    }
    // for (let i = 0; i < this.height; i++) {
    //   for (let j = 0; j < this.width; j++) {
    //     if (sightMap.isVisible(j, i)) {
    //       let tile = this.tiles[j + i*this.width];
    //       display.draw(j, i, tile.getSymbol(), "#fff", "#000");
    //     }
    //   }
    // }
  }
}

class Tile {
  visible: boolean;
  seen: boolean;

  layers: Map<string, number>;

  constructor(terrainLayer: number) {
    this.layers = new Map();
    this.layers.set("TERRAIN", terrainLayer); 
  }

  passable(): boolean {
    return this.layers.get("TERRAIN") != 0;
  }

  blocksSight(): boolean {
    return this.layers.get("TERRAIN") == 0;
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
