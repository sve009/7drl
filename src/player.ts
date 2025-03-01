import { Entity } from "./entity";
import * as Actions from "./action";
import { IOHandler } from "./io";
import { Display } from "rot-js";

export class Player extends Entity {
  ioHandler: IOHandler;

  constructor(x: number, y: number) {
    super();
    this.position = {x, y};
    this.ioHandler = new IOHandler();
  }

  async update() {
    let key = await this.ioHandler.requestKey();
    switch (key) {
      case "h": {
        return new Actions.MoveAction(this, { 
          x: this.position.x-1, 
          y: this.position.y 
        });
        break;
      }
      case "j": {
        return new Actions.MoveAction(this, { 
          x: this.position.x, 
          y: this.position.y+1 
        });
        break;
      }
      case "k": {
        return new Actions.MoveAction(this, { 
          x: this.position.x, 
          y: this.position.y-1 
        });
        break;
      }
      case "l": {
        return new Actions.MoveAction(this, { 
          x: this.position.x+1, 
          y: this.position.y 
        });
        break;
      }
      default: {
        return new Actions.NoAction();
      }
    }
  }

  draw(display: Display) {
    display.draw(this.position.x, this.position.y, "@", "#fff", "#000");
  }
}
