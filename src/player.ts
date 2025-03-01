import { Entity } from "./entity";
import * as Actions from "./action";
import { IOHandler } from "./io";
import { Display } from "rot-js";
import type { GameState, GameMap } from "./gamestate";

export class Player extends Entity {
  visionRadius: number;
  ioHandler: IOHandler;

  constructor(x: number, y: number) {
    super();
    this.position = {x, y};
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

  draw(display: Display) {
    display.draw(this.position.x, this.position.y, "@", "#4287f5", "#000");
  }
}
