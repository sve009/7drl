import { Character } from "./gameObject";
import * as Actions from "./action";
import * as UIGameEvents from "./uiGameEvent"
import { IOHandler } from "./io";
import type { GameState } from "./gamestate";
import { Glyph } from "./renderer";
import { dirMap } from "./constants";
import { Item } from "./item";

export class Player extends Character {
  visionRadius: number;
  ioHandler: IOHandler;
  maxHealth: number;
  health: number;
  distanceTraveled: number;
  visible: boolean = true;

  constructor(x: number, y: number) {
    super();
    this.name = "player";
    this.position = {x, y};
    this.dungeonLevel = 0;

    this.maxHealth = 10;
    this.health = 10;

    this.accuracy = 75;
    this.damage = 3;
    this.dodge = 25;
    this.armor = 0;

    this.visionRadius = 25;
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
          return new UIGameEvents.OpenInventory();
        }
        case ">": {
          const dstair = state.maps[this.dungeonLevel].stairDown;
          if (dstair) {
            if (this.position.x == dstair.x && this.position.y == dstair.y) {
              return new Actions.DescendAction(this);
            }
          }
          break;
        }
        case "<": {
          const ustair = state.maps[this.dungeonLevel].stairUp;
          if (ustair) {
            if (this.position.x == ustair.x && this.position.y == ustair.y) {
              return new Actions.AscendAction(this);
            }
          }
          break;
        }
        case ",": {
          const entity = state.entityAt(
            this.position.x,
            this.position.y,
            this.dungeonLevel,
            false
          );
          if (entity instanceof Item) {
            return new Actions.PickUpAction(this);
          }
          break;
        }
        case ";": {
          return new UIGameEvents.LookModeActivate(this.position);
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

  getGlyph(): Glyph {
    return new Glyph(this.position.x, this.position.y, "@", "#4287f5", "#000")
  }

  die(state: GameState): void {
    console.log("DEATH");
    state.running = false;
  }
}
