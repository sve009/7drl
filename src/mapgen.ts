import * as ROT from "rot-js";
import { GameMap } from "./gamestate";
import { Grid } from "./grid";
import { dirMap, oppDir } from "./constants";
import { randi, joinIndex, breakIndex } from "./utilities";
import { IOHandler } from "./io";
import { ItemGenerator } from "./item";

type DoorPoints = Map<number, { x: number; y: number; }>;

export function generateLevel(gameMap: GameMap) {
  // Placeholder for now
  let map = new ROT.Map.Digger(40, 40);
  map.create((x: number, y: number, wall: number) => {
    if (!wall) {
      gameMap.setTile(x, y, 1);
    }
  });
}

// TODO: Make this profile-based
export class MapGenerator {
  width: number;
  height: number;
  map: GameMap;

  constructor(width: number, height: number, gameMap: GameMap) {
    this.width = width;
    this.height = height;
    this.map = gameMap;
  }

  generateLevel(): void {
    const grid = this.createFirstRoom();  

    // 20 rooms for now
    for (let i = 0; i < 40; i++) {
      const [room, doors] = this.createRoom();
      this.attachRoom(grid, room, doors);
    }

    for (let i = 0; i < grid.width*grid.height; i++) {
      if (grid.values[i]) {
        const { x, y } = breakIndex(i, grid.width);
        this.map.setTile(x, y, grid.values[i]);
      }
    }

    this.addCarpet();
    this.addFoliage();
    this.addPuddles();
    this.addStairs();
    this.addRuins();
    this.addStatues();
  }

  createFirstRoom(): Grid {
    const grid = this.createRectRoom();
    return grid;
  }

  createRoom(): [grid: Grid, doors: DoorPoints] {
    let room;
    switch(randi(0, 2)) {
      case 0: {
        room = this.createRectRoom();
        break;
      }
      case 1: {
        room = this.createCircleRoom();
        break;
      }
    }
    const doorPoints = this.findDoorPoints(room);

    if (randi(0, 2)) {
      this.attachCorridor(room, doorPoints);
    }

    return [room, doorPoints];
  }

  addCarpet(): void {
    const numPaths = randi(4, 10);
    for (let i = 0; i < numPaths; i++) {
      const firstPos = this.map.openSpot();
      const secondPos = this.map.openSpot();

      const dijkstra = new ROT.Path.Dijkstra(
        secondPos.x,
        secondPos.y,
        (x: number, y: number) => {
          return this.map.passable(x, y);
        },
        null
      );

      dijkstra.compute(
        firstPos.x,
        firstPos.y,
        (x: number, y: number) => {
          if (randi(0, 3)) {
            this.map.setTile(x, y, 14);
          }
        }
      );
    }
  }

  addFoliage(): void {
    for (let i = 0; i < randi(10, 25); i++) {
      let { x, y } = this.map.openSpot();
      let r = Math.pow(randi(2, 7), 2);

      for (let y0 = 2; y0 < this.height-2; y0++) {
        for (let x0 = 2; x0 < this.width-2; x0++) {
          // If it's totally disconnected continue
          if (
            this.mapNumberAdjacent(joinIndex(x0, y0, this.width), true) == 0
          ) {
            continue;
          }

          // 1/3 chance to erode map
          if (!randi(0, 3) && !this.map.passable(x0, y0)) {
            continue;
          }
          // 1/5 chance to not place
          if (!randi(0, 5)) {
            continue;
          }
          if (Math.pow(x - x0, 2) + Math.pow(y - y0, 2) < r) {
            const p = ROT.RNG.getPercentage();
            if (p < 5) {
              this.map.setTile(x0, y0, 4);
            } else if (p < 10) {
              this.map.setTile(x0, y0, 5);
            } else {
              this.map.setTile(x0, y0, 3);
            }
          }
        }
      }
    }
  }

  addPuddles(): void {
    const numPuddles = randi(0, 8);
    for (let i = 0; i < numPuddles; i++) {
      const pos = this.map.openSpot();
      const r = Math.pow(randi(3, 9), 2);
      for (let y0 = 2; y0 < this.height - 2; y0++) {
        for (let x0 = 2; x0 < this.width - 2; x0++) {
          if (!this.map.passable(x0, y0)) {
            continue;
          }

          if (Math.pow(pos.x - x0, 2) + Math.pow(pos.y - y0, 2) < r) {
            const isFoliage = randi(0, 4);
            if (!isFoliage) {
              const val = randi(0, 2) ? 19 : 20;
              this.map.setTile(x0, y0, val);
            } else {
              this.map.setTile(x0, y0, 13);
            }
          }
        }
      }
    }
  }

  addStairs(): void {
    // Place up stairs
    let ux: number;
    let uy: number;
    for (const tile of this.map.shuffledTiles()) {
      if (this.map.tiles[tile].tileType.symbol == "#" &&
          this.mapNumberAdjacent(tile, true) == 1 &&
          this.mapNumberAdjacent(tile, false) == 1
      ) {
        let { x, y } = breakIndex(tile, this.width);
        ux = x;
        uy = y;
        this.map.setTile(x, y, 12);
        break;
      }
    }

    // Place down stairs at least 100 units away
    const passable = (x: number, y: number) => {
      return (x == ux && y == uy) || this.map.passable(x, y);
    }
    let found = false;
    let minDistance = 50;
    while (!found) {
      for (const tile of this.map.shuffledTiles()) {
        if (this.map.tiles[tile].tileType.symbol == "#" &&
            this.mapNumberAdjacent(tile, true) == 1 &&
            this.mapNumberAdjacent(tile, false) == 1
        ) {
          const { x, y } = breakIndex(tile, this.width);
          let d = 0;
          const dijkstra = new ROT.Path.Dijkstra(x, y, passable, null);
          dijkstra.compute(ux, uy, (px: number, py: number) => {
            d += 1;
          });
          if (d > minDistance) {
            found = true;
            this.map.setTile(x, y, 11);
            break;
          }
        }
      }
      minDistance -= 10;
    }
  }

  // @pre Call after this.map.upStair not null
  addStatues() {
    // Will skew towards bottom of range since 
    // disconnected don't count
    const numStatues = randi(0, 8);
    for (let i = 0; i < numStatues; i++) {
      for (const tile of this.map.shuffledTiles()) {
        const { x, y } = breakIndex(tile, this.map.width);

        // Only place in passable areas
        if (!this.map.passable(x, y)) {
          continue;
        }

        // Add statue
        const old = this.map.tiles[tile];
        const version = randi(0, 2) ? 17 : 18;
        this.map.setTile(x, y, version);

        // Check that nothing is disconnected
        if (this.isNowDisconnected(x, y)) {
          this.map.tiles[tile] = old;
        }

        break;
      }
    }
  }

  // @pre this.map.upStair not null
  addRuins() {
    const numRuins = randi(0, 4);
    const maxLength = 10;
    const dirToVal = (s: number, n: number) => {
      switch (s) {
        // left
        case 0: {
          switch (n) {
            case 0: {
              return 21;
            }
            case 1: {
              return 23;
            }
            case 2: {
              return 21;
            }
            case 3: {
              return 26;
            }
          }
        }
        // down
        case 1: {
          switch (n) {
            case 0: {
              return 26;
            }
            case 1: {
              return 22;
            }
            case 2: {
              return 25;
            }
            case 3: {
              return 22;
            }
          }
        }
        case 2: {
          switch (n) {
            case 0: {
              return 21;
            }
            case 1: {
              return 24;
            }
            case 2: {
              return 21;
            }
            case 3: {
              return 26;
            }
          }
        }
        case 3: {
          switch (n) {
            case 0: {
              return 24;
            }
            case 1: {
              return 22;
            }
            case 2: {
              return 23;
            }
            case 3: {
              return 22;
            }
          }
        }
      }
    };

    for (let i = 0; i < numRuins; i++) {
      let { x, y }  = this.map.openSpot();
      let sDir = randi(0, 4);
      let go = true;
      let count = 0;
      while (go && count < maxLength) {
        const nDir = randi(0, 4);
        const dPos = dirMap.get(nDir);

        const fx = x + dPos.x;
        const fy = y + dPos.y;

        if (!this.map.passable(x, y)) {
          break;
        }

        const val = dirToVal(sDir, nDir);
        const idx = joinIndex(fx, fy, this.width);
        const old = this.map.tiles[idx];
        this.map.setTile(x, y, val);

        if (this.isNowDisconnected(x, y)) {
          this.map.tiles[idx] = old;
          go = false;
        }

        count++;
        x = fx;
        y = fy;
        sDir = nDir;
      }
    }
  }

  isNowDisconnected(x: number, y: number): boolean {
    const passable = (x: number, y: number) => {
      return this.map.passable(x, y);
    };
    for (let dir = 0; dir < 8; dir++) {
      const dPos = dirMap.get(dir);
      const fx = x + dPos.x;
      const fy = y + dPos.y;

      if (this.map.passable(fx, fy)) {
        let pathExists;
        const dijkstra = new ROT.Path.Dijkstra(fx, fy, passable, null); 
        dijkstra.compute(
          this.map.stairUp.x, 
          this.map.stairUp.y, 
          (x: number, y: number) => {
            pathExists = true;
          }
        );
        if (!pathExists) {
          return true;
        }
      }
    }
    return false;
  }

  createRectRoom(): Grid {
    const grid = new Grid(this.width, this.height);

    const w = randi(3, 10);
    const h = randi(3, 10);
    const x = randi(2, this.width - 12);
    const y = randi(2, this.height - 12);
    grid.drawRectangle(x, y, w, h);

    return grid;
  }

  createCircleRoom(): Grid {
    const grid = new Grid(this.width, this.height);

    const r = randi(3, 5);
    const x = randi(2 + r, this.width - 2 - r);
    const y = randi(2 + r, this.height - 2 -r);
    grid.drawCircle(x, y, r);

    return grid;
  }

  mapNumberAdjacent(index: number, checkDiags: boolean = false): number {
    let sum = 0;
    const { x, y } = breakIndex(index, this.width);
    for (let i = 0; i < (checkDiags ? 8 : 4); i++) {
      const point = dirMap.get(i);
      const newIndex = joinIndex(x + point.x, y + point.y, this.width);
      const tile = this.map.tiles[newIndex];
      if (tile) {
        sum = sum + (tile.tileType.symbol != "#" ? 1 : 0);
      }
    }
    return sum;
  }

  numberAdjacent(grid: Grid, index: number, checkDiags: boolean = false): number {
    let sum = 0;
    const { x, y } = breakIndex(index, this.width);
    for (let i = 0; i < (checkDiags ? 8 : 4); i++) {
      const point = dirMap.get(i); 
      const newIndex = joinIndex(x + point.x, y + point.y, this.width);
      sum = sum + (grid.values[newIndex] ? 1 : 0);
    }
    return sum;
  }

  // @pre numberAdjacent(grid, index) == 1
  dirAdjacent(grid: Grid, index: number): number {
    let { x, y } = breakIndex(index, this.width);
    for (let i = 0; i < 4; i++) {
      const dpoint = dirMap.get(i);
      const dx = dpoint.x;
      const dy = dpoint.y;
      if (grid.values[joinIndex(x + dx, y + dy, this.width)]) {
        return i;
      }
    }
  }

  findDoorPoints(grid: Grid): DoorPoints {
    const m: DoorPoints = new Map();
    const tiles = this.map.shuffledTiles();
    for (const tile of tiles) {
      if (grid.values[tile]) {
        continue;
      }
      if (this.numberAdjacent(grid, tile) == 1) {
        const d = this.dirAdjacent(grid, tile);
        const opp = oppDir.get(d);
        if (!m.has(opp)) {
          m.set(opp, breakIndex(tile, this.width));
          if (m.size == 4) {
            break;
          }
        }
      }
    }
    return m;
  }

  attachCorridor(grid: Grid, doorPoints: DoorPoints) {
    const dir = randi(0, 4);
    const point = doorPoints.get(dir);
    const x = point.x;
    const y = point.y;

    const dpoint = dirMap.get(dir);
    const dx = dpoint.x;
    const dy = dpoint.y;

    const length = randi(3, 8);
    const fits = x + dx * length < this.width - 2
              && x + dx * length > 2
              && y + dy * length < this.height - 2
              && y + dy * length > 2;

    if (!fits) {
      return;
    }

    for (let i = 0; i < length; i++) {
      let fx = x + i * dx;
      let fy = y + i * dy;
      grid.values[joinIndex(fx, fy, this.width)] = 1;
    }

    doorPoints.set(dir, {
      x: x + length * dx,
      y: y + length * dy,
    });

    for (const k of doorPoints.keys()) {
      if (k != dir) {
        doorPoints.delete(k);
      }
    }
  }

  attachRoom (grid: Grid, room: Grid, doors: DoorPoints) {
    const tiles = this.map.shuffledTiles();
    for (const tile of tiles) {
      if (grid.values[tile]) {
        continue;
      }
      if (this.numberAdjacent(grid, tile) == 1) {
        const d = this.dirAdjacent(grid, tile);
        if (!doors.has(d)) {
          continue;
        }

        const rp = doors.get(d); 
        const { x, y } = breakIndex(tile, room.width);
        if (grid.fits(room, x - rp.x + 1, y - rp.y + 1)) {
          grid.merge(room, x - rp.x, y - rp.y);
          grid.values[tile] = 2;
          break;
        }
      }
    }
  }
}

async function printGrid(grid: Grid, display: ROT.Display): Promise<boolean> {
  const handler = new IOHandler;
  for (let i = 0; i < grid.width*grid.height; i++) {
    if (grid.values[i]) {
      const { x, y } = breakIndex(i, 80);
      display.draw(x, y, "x", "#999", "#999");
    }
  }
  await handler.requestKey(); 

  return true;
}
