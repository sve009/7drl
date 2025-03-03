import { Character } from "./entity";
import * as Actions from "./action";
import { IOHandler } from "./io";
import type { GameState, GameMap } from "./gamestate";
import type { SightMap } from "./fov";
import { Glyph } from "./renderer";
import { dirMap } from "./constants";

export class Player extends Character {
  visionRadius: number;
  ioHandler: IOHandler;
  health: number;

  constructor(x: number, y: number) {
    super();
    this.position = {x, y};
    this.health = 10;
    this.visionRadius = 8;
    this.ioHandler = new IOHandler();
  }

  async update(state: GameState) {
    let pos = {
      x: this.position.x,
      y: this.position.y
    };
    while (true) {
    let key = await this.ioHandler.requestKey();
      let dir = -1;
      switch (key) {
        case "h": {
          dir = 0;
          break;
        }
        case "j": {
          dir = 1;
          break;
        }
        case "k": {
          dir = 3;
          break;
        }
        case "l": {
          dir = 2;
          break;
        }
        case "y": {
          dir = 7;
          break;
        }
        case "u": {
          dir = 6;
          break;
        }
        case "b": {
          dir = 4;
          break;
        }
        case "n": {
          dir = 5;
          break;
        }
        default: {
          return new Actions.NoAction();
        }
      }

      if (dir != -1) {
        const { x, y } = dirMap.get(dir);
        const fx = this.position.x + x;
        const fy = this.position.y + y;
        const e = state.entityAt(this.position.x + x, this.position.y + y);
        if (e instanceof Character) {
          return new Actions.AttackAction(this, e as Character); 
        } else if (this.canMove({ x: fx, y: fy}, state.map)) {
          return new Actions.MoveAction(this, { x: fx, y: fy });
        }
      }
    }
  }

  updateColor(sightMap: SightMap) {
    return new Glyph(this.position.x, this.position.y, "@", "#4287f5", "#000")
  }

  attack(): [number, number] {
    return [75, 5];
  }

  defend(): [number, number] {
    return [40, 0];
  }

  die(state: GameState): void {
    console.log("DEATH");
    state.running = false;
  }
}
