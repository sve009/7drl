import { RNG, Color } from "rot-js";
import { SightMap } from "./fov";
import { Player } from "./player";
import { getRenderer, Glyph, Layer, Position } from "./renderer";
import { GameEntity } from "./gameObject";
import town from "./data/town.json";

const townMap = town.gameMap;

export class GameState {
  boundaries: Position
  running: boolean;
  maps: GameMap[];
  dungeonLevel: number;
  sightMap: SightMap;
  player?: Player;
  entities: GameEntity[];
  entityLayer: Layer;
  terrainLayer: Layer;

  constructor(boundaries: Position) {
    this.boundaries = boundaries;

    this.running = false;
    this.maps = [];
    this.sightMap = new SightMap(80, 40, this.maps);
    this.entities = [];
    this.entityLayer = new Layer(1, boundaries);
    this.terrainLayer = new Layer(0, boundaries);
    this.terrainLayer.bg = "#000";
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
    getRenderer().layers.push(this.entityLayer, this.terrainLayer);
    const pdl = this.player.dungeonLevel;
    this.maps[pdl].refreshVisual(this.terrainLayer, this.sightMap);

    for (const entity of this.entities) {
      if (entity.dungeonLevel == pdl) {
        const glyph = entity.refreshVisuals();
        if (!glyph) {
          continue;
        }
        this.entityLayer.addDrawable(glyph);
      }
    }
  }

  fullRefresh () {
    this.terrainLayer.refresh = true;
  }

  entityAt(x: number, y: number, z: number): GameEntity | null {
    for (const entity of this.entities) {
      if (entity.position.x == x && 
          entity.position.y == y &&
          entity.dungeonLevel == z
         ) {
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

  // Convenience
  stairDown?: { x: number; y: number; };
  stairUp?: { x: number; y: number; };
  
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
      const x = i % this.width;
      const y = Math.floor(i / this.width);
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
    const index = x + this.width*y;
    if (index < 0 || index > this.width*this.height) {
      return false;
    }

    return this.tiles[index].passable();
  }

  blocksSight(x: number, y: number): boolean {
    const index = x + this.width*y;
    if (index < 0 || index > this.width*this.height) {
      return false;
    }
    
    return this.tiles[index].blocksSight();
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
      case 11: {
        t = TileTypeFactory.create(">");
        this.stairDown = { x, y };
        break;
      }
      case 12: {
        t = TileTypeFactory.create("<");
        this.stairUp = { x, y };
        break;
      }
    }

    let tile = new Tile(t);
    this.tiles[x + this.width*y] = tile;
  }

  refreshVisual(layer: Layer, sightMap: SightMap) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) { 
        const visible = sightMap.isVisible(j, i);
        const tile = this.tiles[j + i*this.width];
        const [fg, bg] = tile.getColor(visible);
        if (visible) {
          tile.seen = true;
          layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
        } else if (tile.seen) {
          layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
        } else {
          layer.addDrawable(new Glyph(j, i, tile.getSymbol(), fg, bg));
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
      const multiplicant = Color.fromString("#555");
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
      case ">": {
        return new TileType(
          ">",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "<": {
        return new TileType(
          "<",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
    }
  }
}
