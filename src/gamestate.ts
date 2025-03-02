import { Entity } from "./entity"
import { RNG } from "rot-js";
import { SightMap } from "./fov";
import { Player } from "./player";
import { Glyph, Layer } from "./renderer";

export class GameState {
  running: boolean;
  map: GameMap;
  sightMap: SightMap;
  player?: Player;
  entities: Entity[];
  entityLayer: Layer;

  constructor() {
    this.running = false;
    this.map = new GameMap(80, 40);
    this.sightMap = new SightMap(80, 40, this.map);
    this.entities = [];
    this.entityLayer = new Layer(1, 80, 40);
  }

  updateColor() {
    this.map.updateColor(this.sightMap);

    for (const entity of this.entities) {
      const {x, y, glyph} = entity.updateColor(this.sightMap);
      if (!glyph) {
        continue;
      }
      this.entityLayer.board[y][x] = glyph;
    }
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
    const offset = Math.floor(RNG.getUniform() * this.width * this.height);
    for (let i = 0; i < this.width*this.height; i++) {
      const j = (i + offset) % (this.width * this.height);
      const x = j % this.width;
      const y = Math.floor(j / this.width);
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

  updateColor(sightMap: SightMap) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) { 
        let tile = this.tiles[j + i*this.width];
        if (sightMap.isVisible(j, i)) {
          let tile = this.tiles[j + i*this.width];
          tile.seen = true;
          this.layer.board[i][j] = new Glyph(tile.getSymbol(), "#fff", "#000");
        } else if (tile.seen) {
          this.layer.board[i][j] = new Glyph(tile.getSymbol(), "#999", "#000");
        } else {
          this.layer.board[i][j] = new Glyph(tile.getSymbol(), "#000", "#000");
        }
      }
    }
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
