import { RNG, Color } from "rot-js";
import { SightMap } from "./fov";
import { Player } from "./player";
import { getRenderer, Glyph, Layer, Position } from "./renderer";
import { GameEntity, Character } from "./gameObject";
import { Enemy } from "./enemies";
import * as Items from "./item";
import town from "./data/town.json";

const townMap = town.gameMap;

export class GameState {
  boundaries: Position
  running: boolean;
  maps: GameMap[];
  sightMap: SightMap;
  player?: Player;
  entities: GameEntity[];
  entityLayer: Layer;
  terrainLayer: Layer;
  fullRefreshVisual: boolean
  positionToRemember: { x: number, y: number } | null = null;
  shopInventories: Map<string, Items.Item[]>;

  get currentMap (): GameMap {
    return this.maps[this.player.dungeonLevel];
  }

  constructor(boundaries: Position) {
    this.boundaries = boundaries;

    this.running = false;
    this.maps = [];
    this.sightMap = new SightMap(80, 40, this.maps);
    this.entities = [];
    this.entityLayer = new Layer(1, boundaries);
    this.terrainLayer = new Layer(0, boundaries);
    this.terrainLayer.bg = "#000";
    this.fullRefreshVisual = false;
    this.shopInventories = new Map();

    this.refreshShopInventories(0);
  }

  async update () {
    // Update entities. Player is always first.
    for (let entity of this.entities) {
      // Apply buffs / debuffs
      if (entity instanceof Character) {
        entity.applyBuffs(this);
      }
      let action = await entity.updateState(this);
      action.run(this);
      if (action.isUIEvent) {
        break
      }
    }

    // Update fov
    this.sightMap.update(this.player);
  }

  refreshVisual() {
    getRenderer().layers.push(this.entityLayer, this.terrainLayer);
    const pdl = this.player.dungeonLevel;
    this.maps[pdl].refreshVisual(this.terrainLayer, this.sightMap);

    // Draw player last
    for (const entity of this.entities.slice().reverse()) {
      if (entity.dungeonLevel == pdl) {
        entity.checkVisible(this.sightMap);
        const glyph = entity.refreshVisuals();
        if (!glyph) {
          continue;
        }
        this.entityLayer.addDrawable(glyph);
      }
    }
  }

  fullRefresh () {
    this.fullRefreshVisual = true;
    this.terrainLayer.refresh = true;
    this.sightMap.update(this.player);
  }

  entityAt(
    x: number, 
    y: number, 
    z: number, 
    includePlayer: boolean = true
  ): GameEntity | null {
    for (const entity of this.entities) {
      if (entity.position.x == x && 
          entity.position.y == y &&
          entity.dungeonLevel == z
         ) {
        if (!includePlayer && entity instanceof Player) {
          continue;
        }
        return entity;
      }
    }

    return null;
  }

  allEntitiesAt(
    x: number,
    y: number,
    z: number,
    includePlayer: boolean = true
  ): Array<GameEntity> {
    const allEntities = Array<GameEntity>();
    for (const entity of this.entities) {
      if (entity.position.x == x && 
        entity.position.y == y &&
        entity.dungeonLevel == z
      ) {
        if (!includePlayer && entity instanceof Player) {
          continue;
        }
        allEntities.push(entity);
      }
    }
    return allEntities;
  }

  openSpot(z: number): { x: number; y: number; } {
    let found = false;
    let pos;
    while (!found) {
      pos = this.maps[z].openSpot();
      found = !this.entityAt(pos.x, pos.y, z);
    }

    return pos;
  }

  isWithinMapBoundaries(fx: number, fy: number): boolean {
    return 0 <= fy && fy < this.currentMap.height &&
      0 <= fx && fx < this.currentMap.width;
  }

  shopInventory(name: string): Items.Item[] {
    return this.shopInventories.get(name);
  }

  refreshShopInventories(z: number) {
    // Blacksmith
    const equips = [
      Items.BasicWeaponArmorFactory.createRandomBasicWeapon(),
      Items.BasicWeaponArmorFactory.createRandomBasicArmor(),
    ];
    this.shopInventories.set("blacksmith", equips);
    
    // Librarian
    const scrolls: Items.Item[] = [];
    for (let i = 0; i < 5; i++) {
      scrolls.push(
        Items.ScrollFactory.getRandomScroll()
      );
    }
    this.shopInventories.set("librarian", scrolls);

    // Alchemist
    const pots: Items.Item[] = [];
    for (let i = 0; i < 5; i++) {
      pots.push(
        Items.PotionFactory.getRandomPotion()
      );
    }
    this.shopInventories.set("alchemist", pots);
  }

  getDescription (x: number, y: number): { tileID: string | null, entities: Array<GameEntity> } {
    return { tileID: this.currentMap.getTileID(x, y),
      entities: this.allEntitiesAt(x, y, this.player.dungeonLevel, false)};
  }
}

export class GameMap {
  width: number;
  height: number;
  tiles: Tile[];
  layer: Layer;
  isFullyVisible: boolean;

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

  loadTown(state: GameState): void {
    this.width = town.width;
    this.height = town.height;
    for (let i = 0; i < townMap.length; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      this.setTile(x, y, townMap[i]);
    }

    const shopkeepers = [
      new Enemy("shopkeeper", 10, 26, 0),
      new Enemy("shopkeeper", 8, 10, 0),
      new Enemy("shopkeeper", 25, 36, 0),
      new Enemy("priest", 27, 2, 0),
    ];
    const names = [
      "alchemist",
      "blacksmith",
      "librarian",
      "priest",
    ];
    for (let i = 0; i < shopkeepers.length; i++) {
      const e = shopkeepers[i];
      e.name = names[i];
      state.entities.push(e);
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
      if (this.passable(x, y) && this.tiles[tile].getSymbol() != "+") {
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
        t = TileTypeFactory.create("wall");
        break;
      }
      case 1: {
        t = TileTypeFactory.create("ground");
        break;
      }
      case 2: {
        t = TileTypeFactory.create("door");
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
      case 13: {
        t = TileTypeFactory.create("swater");
        break;
      }
      case 14: {
        t = TileTypeFactory.create("carpet");
        break;
      }
      case 15: {
        t = TileTypeFactory.create("woodf");
        break;
      }
      case 16: {
        t = TileTypeFactory.create("path");
        break;
      }
      case 17: {
        t = TileTypeFactory.create("statue1");
        break;
      }
      case 18: {
        t = TileTypeFactory.create("statue2");
        break;
      }
      case 19: {
        t = TileTypeFactory.create("lilypad");
        break;
      }
      case 20: {
        t = TileTypeFactory.create("reed");
        break;
      }
      case 21: {
        t = TileTypeFactory.create("ruin1");
        break;
      }
      case 22: {
        t = TileTypeFactory.create("ruin2");
        break;
      }
      case 23: {
        t = TileTypeFactory.create("ruin3");
        break;
      }
      case 24: {
        t = TileTypeFactory.create("ruin4");
        break;
      }
      case 25: {
        t = TileTypeFactory.create("ruin5");
        break;
      }
      case 26: {
        t = TileTypeFactory.create("ruin6");
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

  getTileID (x: number, y: number): string | null {
    const t = this.tiles[x + y*this.width];
    return (t.seen)
      ? t.tileType.name
      : null;
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
  name: string;
  passable: (t: Tile) => boolean;
  blocksSight: (t: Tile) => boolean;

  constructor(
    name: string,
    symbol: string, 
    foreground: string, 
    background: string, 
    passable: (t: Tile) => boolean,
    blocksSight: (t: Tile) => boolean,
  ) {
      this.name = name;
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
      case "wall": {
        return new TileType(
          symbol,
          "#",
          "#fff",
          "#444",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ground": {
        return new TileType(
          symbol,
          ".",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false
        );
      }
      case "door": {
        return new TileType(
          symbol,
          "+",
          "#fff",
          "##593909",
          (t: Tile) => true,
          (t: Tile) => !t.open,
        );
      }
      case "grass": {
        return new TileType(
          symbol,
          "\u{0022}",
          "#549e26",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "bush": {
        return new TileType(
          symbol,
          "\u{2660}",
          "#18c434",
          "#000",
          (t: Tile) => true,
          (t: Tile) => true,
        );
      }
      case "shrub": {
        return new TileType(
          symbol,
          "\u{2663}",
          "#31995e",
          "#000",
          (t: Tile) => true,
          (t: Tile) => true,
        );
      }
      case "altar": {
        return new TileType(
          symbol,
          "\u{2020}",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "water": {
        return new TileType(
          symbol,
          "\u{2248}",
          "#13166e",
          "#242552",
          (t: Tile) => false,
          (t: Tile) => false,
        );
      }
      case "swater": {
        return new TileType(
          symbol,
          " ",
          "#101230",
          "#3c3e7d",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "leaf": {
        return new TileType(
          symbol,
          "\u{2042}",
          "#18b85a",
          "#186337",
          (t: Tile) => false,
          (t: Tile) => false,
        );
      }
      case "hshelf": {
        return new TileType(
          symbol,
          "\u{2550}",
          "#966111",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "vshelf": {
        return new TileType(
          symbol,
          "\u{2551}",
          "#966111",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case ">": {
        return new TileType(
          symbol,
          ">",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "<": {
        return new TileType(
          symbol,
          "<",
          "#fff",
          "#000",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "carpet": {
        return new TileType(
          symbol,
          " ",
          "#fff",
          "#910707",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "woodf": {
        return new TileType(
          symbol,
          ".",
          "#593b20",
          "#362212",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "path": {
        return new TileType(
          symbol,
          ".",
          "#403221",
          "#5e4c35",
          (t: Tile) =>  true,
          (t: Tile) => false,
        );
      }
      case "statue1": {
        return new TileType(
          symbol,
          "\u{2359}",
          "#c79a12",
          "#000",
          (t: Tile) => false,
          (t: Tile) => false,
        );
      }
      case "statue2": {
        return new TileType(
          symbol,
          "\u{235C}",
          "#9195a3",
          "#000",
          (t: Tile) => false,
          (t: Tile) => false,
        );
      }
      case "lilypad": {
        return new TileType(
          symbol,
          "\u{230C}",
          "#2de346",
          "#3c3e7d",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "reed": {
        return new TileType(
          symbol,
          "\u{2300}",
          "#48bf11",
          "#3c3e7d",
          (t: Tile) => true,
          (t: Tile) => false,
        );
      }
      case "ruin1": {
        return new TileType(
          symbol,
          "\u{2550}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ruin2": {
        return new TileType(
          symbol,
          "\u{2551}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ruin3": {
        return new TileType(
          symbol,
          "\u{2554}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ruin4": {
        return new TileType(
          symbol,
          "\u{2557}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ruin5": {
        return new TileType(
          symbol,
          "\u{255A}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
      case "ruin6": {
        return new TileType(
          symbol,
          "\u{255D}",
          "#a99ff5",
          "#000",
          (t: Tile) => false,
          (t: Tile) => true,
        );
      }
    }
  }
}
