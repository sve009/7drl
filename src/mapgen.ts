import * as ROT from "rot-js";
import { GameMap } from "./gamestate";
import { Grid } from "./grid";
import { dirMap, oppDir } from "./constants";
import { randi, joinIndex, breakIndex } from "./utilities";
import { IOHandler } from "./io";

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

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  generateLevel(): void {
      
  }

  createRoom(): [grid: Grid, doors: DoorPoints] {
    let room;
    switch(randi(0, 2)) {
      case 0: {
        console.log('rect');
        room = this.createRectRoom();
        break;
      }
      case 1: {
        console.log('circle');
        room = this.createCircleRoom();
        break;
      }
    }
    const doorPoints = this.findDoorPoints(room);
    console.log('doorPoints', doorPoints);

    if (randi(0, 2)) {
      this.attachCorridor(room, doorPoints);
    }

    return [room, doorPoints];
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

  shuffledTiles(): number[] {
    const nums = [...Array(this.width*this.height).keys()];
    return ROT.RNG.shuffle(nums);
  }

  numberAdjacent(grid: Grid, index: number): number {
    let sum = 0;
    const { x, y } = breakIndex(index, this.width);
    for (let i = 0; i < 4; i++) {
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
    const tiles = this.shuffledTiles();
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
