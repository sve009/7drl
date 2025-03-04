import { Character } from "./gameObject";
import * as Actions from "./action";
import { IOHandler } from "./io";
import type { GameState, GameMap } from "./gamestate";
import type { SightMap } from "./fov";
import { Glyph } from "./renderer";
import { dirMap } from "./constants";
import { getUIManager } from "./uiManager";

export class Player extends Character {
  visionRadius: number;
  ioHandler: IOHandler;
  health: number;
  maxHealth: number;
  distanceTraveled: number;

  constructor(x: number, y: number) {
    super();
    this.name = "player";
    this.position = {x, y};
    this.dungeonLevel = 0;
    this.health = 10;
    this.maxHealth = 10;
    this.visionRadius = 8;
    this.distanceTraveled = 0;
    this.ioHandler = new IOHandler();
  }

  async updateState(state: GameState) {
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
        case "i": {
          getUIManager().openInventory();
          return new Actions.NoAction();
        }
        default: {
          return new Actions.NoAction();
        }
      }

      if (dir != -1) {
        const { x, y } = dirMap.get(dir);
        const fx = this.position.x + x;
        const fy = this.position.y + y;
        const e = state.entityAt(
          this.position.x + x, 
          this.position.y + y,
          this.dungeonLevel
        );
        this.distanceTraveled += 1;
        if (e instanceof Character) {
          return new Actions.AttackAction(this, e as Character); 
        } else if (this.canMove({ x: fx, y: fy}, state.maps[this.dungeonLevel])) {
          return new Actions.MoveAction(this, { x: fx, y: fy });
        }
      }
    }
  }

  refreshVisuals() {
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
