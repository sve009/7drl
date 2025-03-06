import { FOV } from "rot-js";
import { Player } from "./player";
import { GameMap } from "./gamestate";

export class SightMap {
  width: number;
  height: number;

  private maps: GameMap[];
  private visible: boolean[];

  constructor(width: number, height: number, maps: GameMap[]) {
    this.width = width;
    this.height = height;
    this.maps = maps;
    this.visible = [];
    for (let i = 0; i < this.width*this.height; i++) {
      this.visible.push(false);
    }
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
    const map = this.maps[player.dungeonLevel];
    if (map.isFullyVisible) {
      for (let i = 0; i < this.width*this.height; i++) {
        this.visible[i] = true;
      }
      return;
    }
    const lightPasses = (x: number, y:number) => {
      return !map.blocksSight(x, y);
    };

    const fov = new FOV.RecursiveShadowcasting(lightPasses);

    this.zeroOut();
    fov.compute(
      player.position.x, 
      player.position.y,
      player.visionRadius,
      (x: number, y: number, _r: number, _v: number) => {
        this.visible[x + this.width*y] = true;
      }
    );
  }
}
