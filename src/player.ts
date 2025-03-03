import { Entity } from "./entity";
import * as Actions from "./action";
import { IOHandler } from "./io";
import type { GameState, GameMap } from "./gamestate";
import type { SightMap } from "./fov";
import { Glyph } from "./renderer";

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
    let pos = {
      x: this.position.x,
      y: this.position.y
    };
    while (true) {
      let key = await this.ioHandler.requestKey();
      switch (key) {
        case "h": {
          pos.x -= 1;
          break;
        }
        case "j": {
          pos.y += 1;
          break;
        }
        case "k": {
          pos.y -= 1;
          break;
        }
        case "l": {
          pos.x += 1;
          break;
        }
        default: {
          return new Actions.NoAction();
        }
      }
      if (this.canMove(pos, state.map)) {
        return new Actions.MoveAction(this, pos);  
      }
    }
  }

  updateColor(sightMap: SightMap) {
    return new Glyph(this.position.x, this.position.y, "@", "#4287f5", "#000")
  }
}
