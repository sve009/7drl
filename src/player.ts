import { Character } from "./entity";
import * as Actions from "./action";
import { IOHandler } from "./io";
import type { GameState, GameMap } from "./gamestate";
import type { SightMap } from "./fov";
import { Glyph } from "./renderer";

export class Player extends Character {
  visionRadius: number;
  ioHandler: IOHandler;
  health: number;

  constructor(x: number, y: number) {
    super();
    this.position = {x, y};
    this.health = 10;
    this.visionRadius = 5;
    this.ioHandler = new IOHandler();
  }

  async update(state: GameState) {
    while (true) {
    let key = await this.ioHandler.requestKey();
      switch (key) {
        case "h": {
          let pos = {
            x: this.position.x-1, 
            y: this.position.y 
          };
          if (this.canMove(pos, state.map)) {
            return new Actions.MoveAction(this, pos);  
          }
          break;
        }
        case "j": {
          let pos = {
            x: this.position.x, 
            y: this.position.y+1 
          };
          if (this.canMove(pos, state.map)) {
            return new Actions.MoveAction(this, pos);  
          }
          break;
        }
        case "k": {
          let pos = {
            x: this.position.x, 
            y: this.position.y-1 
          };
          if (this.canMove(pos, state.map)) {
            return new Actions.MoveAction(this, pos);  
          }
          break;
        }
        case "l": {
          let pos = {
            x: this.position.x+1, 
            y: this.position.y 
          };
          if (this.canMove(pos, state.map)) {
            return new Actions.MoveAction(this, pos);  
          }
          break;
        }
        default: {
          return new Actions.NoAction();
        }
      }
    }
  }

  updateColor(sightMap: SightMap) {
    return new Glyph(this.position.x, this.position.y, "@", "#4287f5", "#000")
  }

  attack(): [number, number] {
    return [0, 0];
  }

  defend(): [number, number] {
    return [0, 0];
  }
}
