import { RNG, Color } from "rot-js";
import { SightMap } from "./fov";
import { Player } from "./player";
import { Glyph, Layer, Position } from "./renderer";
import { GameEntity } from "./gameObject";
import town from "./data/town.json";

const townMap = town.gameMap;

export class GameState {
  boundaries: Position
  running: boolean;
  map: GameMap;
  sightMap: SightMap;
  player?: Player;
  entities: GameEntity[];
  entityLayer: Layer;

  constructor(boundaries: Position) {
    this.running = false;
    this.map = new GameMap(boundaries);
    this.sightMap = new SightMap(this.map);
    this.entities = [];
    this.entityLayer = new Layer(1, boundaries);
  }

  async update () {
    // Update entities
    for (let entity of this.entities) {
      let action = await entity.updateState(this);
      action.run(this);
    }

    // Update FOV
    this.sightMap.update(this.player);
  }

  refreshVisual() {
    this.map.refreshVisual(this.sightMap);

    for (const entity of this.entities) {
      const glyph = entity.refreshVisuals(this.sightMap);
      if (!glyph) {
        continue;
      }
      this.entityLayer.addDrawable(glyph);
    }
  }

  entityAt(x: number, y: number): GameEntity | null {
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
  
  constructor(boundaries: Position) {
    this.width = boundaries.getWidth();
    this.height = boundaries.getHeight();
    this.tiles = [];
    for (let i = 0; i < this.width * this.height; i++) {
      let tile = new Tile(TileTypeFactory.create("#"));
      this.tiles.push(tile);
    }
    this.layer = new Layer(0, boundaries);
  }

  loadTown(): void {
    this.width = town.width;
    this.height = town.height;
    for (let i = 0; i < townMap.length; i++) {
      const x = i % townMap.length;
      const y = Math.floor(i / townMap.length);
      this.setTile(x, y, townMap[i]);
    }
  }

  shuffledTiles(): number[] {
    const nums = [...Array(this.width*this.height).keys()];
    return RNG.shuffle(nums);
  }

  openSpot(): { x: number; y: number; } {
    const tiles = this.shuffledTiles();
    for (const tile of tiles) {
      const x = tile % this.width;
      const y = Math.floor(tile / this.width);
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
      case 3: {
        t = TileTypeFactory.create("grass");
        break;
      }
      case 4: {
        t = TileTypeFactory.create("bush");
        break;
      }
      case 5: {
        t = TileTypeFactory.create("shrub");
        break;
      }
      case 6: {
        t = TileTypeFactory.create("altar");
        break;
      }
      case 7: {
        t = TileTypeFactory.create("leaf");
        break;
      }
      case 8: {
        t = TileTypeFactory.create("water");
        break;
      }
      case 9: {
        t = TileTypeFactory.create("hshelf");
        break;
      }
      case 10: {
        t = TileTypeFactory.create("vshelf");
        break;
      }
    }

    let tile = new Tile(t);
    this.tiles[x + this.width*y] = tile;
  }

  refreshVisual(sightMap: SightMap) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) { 
        const visible = sightMap.isVisible(j, i);
        const tile = this.tiles[j + i*this.width];
        const [fg, bg] = tile.getColor(visible);
        if (true /* visible */) {
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
      case "grass": {
        return new TileType(
          "\u{0022}",
          "#549e26",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );

      }
      case "bush": {
        return new TileType(
          "\u{2660}",
          "#18c434",
          "#000",
          (t: Tile) => true,
          (t: Tile) => true,
        );
      }
      case "shrub": {
        return new TileType(
          "\u{2663}",
          "#31995e",
          "#000",
          (t: Tile) => true,
          (t: Tile) => true,
        );
      }
      case "altar": {
        return new TileType(
          "\u{2020}",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "water": {
        return new TileType(
          "\u{2248}",
          "#4994de",
          "#1939b0",
          (t: Tile) => false,
          (t: Tile) => false,
        );
        break;
      }
      case "leaf": {
        return new TileType(
          "\u{2042}",
          "#18b85a",
          "#186337",
          (t: Tile) => false,
          (t: Tile) => false,
        );
        break;
      }
      case "hshelf": {
        return new TileType(
          "\u{2550}",
          "#966111",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "vshelf": {
        return new TileType(
          "\u{2551}",
          "#966111",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
    }
  }
}
