import { Entity } from "./entity"
import { RNG, Color } from "rot-js";
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
    this.entityLayer = new Layer(1);
  }

  async update () {
    // Update entities
    for (let entity of this.entities) {
      let action = await entity.update(this);
      action.run(this);
    }

    // Update FOV
    this.sightMap.update(this.player);
  }

  updateColor() {
    this.map.updateColor(this.sightMap);

    for (const entity of this.entities) {
      const glyph = entity.updateColor(this.sightMap);
      if (!glyph) {
        continue;
      }
      this.entityLayer.addDrawable(glyph);
    }
  }

  entityAt(x: number, y: number): Entity | null {
    for (const entity of this.entities) {
      if (entity.position.x == x && entity.position.y == y) {
        return entity;
      }
    }

    return null;
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
      let tile = new Tile(TileTypeFactory.create("#"));
      this.tiles.push(tile);
    }
    this.layer = new Layer(0);
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

  setOpenness(x: number, y: number, val: boolean) {
    this.tiles[x + this.width*y].open = val;
  }

  setTile(x: number, y: number, value: number) {
    let t: TileType;
    switch (value) {
      case 0: {
        t = TileTypeFactory.create("#");
        break;
      }
      case 1: {
        t = TileTypeFactory.create(".");
        break;
      }
      case 2: {
        t = TileTypeFactory.create("+");
        break;
      }
    }

    let tile = new Tile(t);
    this.tiles[x + this.width*y] = tile;
  }

  updateColor(sightMap: SightMap) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) { 
        const visible = sightMap.isVisible(j, i);
        const tile = this.tiles[j + i*this.width];
        const [fg, bg] = tile.getColor(visible);
        if (visible) {
          tile.seen = true;
          this.layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
        } else if (tile.seen) {
          this.layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
        } else {
          this.layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
        }
      }
    }
  }
}

class Tile {
  tileType: TileType;
  seen: boolean;
  open: boolean;

  constructor(t: TileType) {
    this.tileType = t;
    this.seen = false;
    this.open = false;
  }

  passable(): boolean {
    return this.tileType.passable(this);
  }

  blocksSight(): boolean {
    return this.tileType.blocksSight(this);
  }

  getSymbol(): string {
    return this.tileType.symbol;
  }

  getColor(visible: boolean): [string, string] {
    if (!visible && !this.seen) {
      return ["#000", "#000"];
    }

    let fg = Color.fromString(this.tileType.foreground);
    let bg = Color.fromString(this.tileType.background);

    if (!visible) {
      const multiplicant = Color.fromString("#333");
      fg = Color.multiply(fg, multiplicant);
      bg = Color.multiply(fg, multiplicant);
    }

    return [
      Color.toHex(fg),
      Color.toHex(bg),
    ];
  }
}

class TileType {
  symbol: string;
  foreground: string;
  background: string;
  passable: (t: Tile) => boolean;
  blocksSight: (t: Tile) => boolean;

  constructor(
    symbol: string, 
    foreground: string, 
    background: string, 
    passable: (t: Tile) => boolean,
    blocksSight: (t: Tile) => boolean,
  ) {
      this.symbol = symbol;
      this.foreground = foreground;
      this.background = background;
      this.passable = passable;
      this.blocksSight = blocksSight;
  }
}

class TileTypeFactory {
  static create(symbol: string): TileType {
    switch (symbol) {
      case "#": {
        return new TileType(
          "#",
          "#fff",
          "#444",
          (t: Tile) => false,
          (t: Tile) => true
        );
      }
      case ".": {
        return new TileType(
          ".",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false
        );
      }
      case "+": {
        return new TileType(
          "+",
          "#fff",
          "##593909",
          (t: Tile) => true,
          (t: Tile) => !t.open,
        );
      }
    }
  }
}
