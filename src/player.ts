import { Character } from "./gameObject";
import * as Actions from "./action";
import * as UIGameEvents from "./uiGameEvent"
import { IOHandler } from "./io";
import type { GameState } from "./gamestate";
import { Glyph } from "./renderer";
import { dirMap } from "./constants";
import { Item } from "./item";
import { Inventory } from "./inventory";
import { getUIManager, logMessage } from "./uiManager";
import { Enemy } from "./enemies";

export class Player extends Character {
  ioHandler: IOHandler;
  maxHealth: number;
  health: number;
  regen: number;
  distanceTraveled: number;
  gold: number;
  artifacts: number;

  visible: boolean = true;
  private visionRadiusByLevel: Array<number> = [200, 25, 25];

  constructor(x: number, y: number) {
    super();
    this.name = "player";
    this.position = {x, y};
    this.dungeonLevel = 0;

    this.items = new Inventory();

    this.maxHealth = 10;
    this.health = 10;
    this.regen = 1;

    this.accuracy = 75;
    this.damage = 3;
    this.dodge = 0;
    this.armor = 0;

    this.distanceTraveled = 0;
    this.gold = 75;
    this.artifacts = 0;
    this.ioHandler = new IOHandler();
  }

  async updateState(state: GameState) {
    if (this.distanceTraveled % 50 == 0) {
      this.health = Math.min(
        this.maxHealth, 
        this.health + this.regen
      );
    }
    while (true) {
      let key = await this.ioHandler.requestKey();
      let dir = -1;
      switch (key) {
        case "left": {
          dir = 0;
          break;
        }
        case "down": {
          dir = 1;
          break;
        }
        case "up": {
          dir = 3;
          break;
        }
        case "right": {
          dir = 2;
          break;
        }
        case "upleft": {
          dir = 7;
          break;
        }
        case "upright": {
          dir = 6;
          break;
        }
        case "downleft": {
          dir = 4;
          break;
        }
        case "downright": {
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
        case "?": {
          return new UIGameEvents.OpenHelp();
        }
        case "escape": {
          return new UIGameEvents.OpenPauseMenu();
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
        if (e instanceof Enemy) {
          if ("passive" in e.enemyType.ai && e.enemyType.ai.passive) {
            if (e.name != "priest") {
              return new UIGameEvents.OpenShop(e.name);
            } else {
              if (this.artifacts > 0) {
                this.artifacts--;
                this.regen++;
                this.maxHealth += 5;
                this.health = this.maxHealth;
                this.damage += 1;
                this.accuracy += 10;
                this.dodge += 10;
                this.armor += 1;

                logMessage("You hand over an artifact");
                logMessage("The priest blesses you");
                logMessage("You feel stronger");

              }

              return new Actions.NoAction();
            }
          }
          return new Actions.AttackAction(this, e as Character); 
        } else if (this.canMove({ x: fx, y: fy}, state.maps[this.dungeonLevel])) {
          return new Actions.MoveAction(this, { x: fx, y: fy });
        }
      }
    }
  }

  visionRadius(): number {
    if (this.dungeonLevel >= this.visionRadiusByLevel.length) {
      return 25;
    }
    return this.visionRadiusByLevel[this.dungeonLevel];
  }

  getGlyph(): Glyph {
    return new Glyph(this.position.x, this.position.y, "@", "#4287f5", "#000")
  }

  die(state: GameState): void {
    logMessage("Death comes for us all. GAME OVER");
    getUIManager().showEndScreen();
  }
}
