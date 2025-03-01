import { FOV } from "rot-js";
import { Player } from "./player";
import { GameMap } from "./gamestate";

export class SightMap {
  width: number;
  height: number;
  private map: GameMap;
  private visible: boolean[];

  // Can't figure out this guy's type
  private fov: any;

  constructor(width: number, height: number, map: GameMap) {
    this.width = width;
    this.height = height;
    this.visible = [];
    for (let i = 0; i < width*height; i++) {
      this.visible.push(false);
    }

    let lightPasses = (x: number, y:number) => {
      return !map.blocksSight(x, y);
    };
    this.fov = new FOV.RecursiveShadowcasting(lightPasses);
  }

  zeroOut(): void {
    for (let i = 0; i < this.width*this.height; i++) {
      this.visible[i] = false;
    }
  }

  isVisible(x: number, y: number): boolean {
    return this.visible[x + y*this.width];
  }

  update(player: Player): void {
    this.zeroOut();
    this.fov.compute(
      player.position.x, 
      player.position.y,
      player.visionRadius,
      (x: number, y: number, _r: number, _v: number) => {
        this.visible[x + this.width*y] = true;
      }
    );
  }
}
