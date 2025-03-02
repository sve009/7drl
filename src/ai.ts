import { RNG } from "rot-js";
import { dirMap } from "./constants";
import type { GameState } from "./gamestate";
import { Action, MoveAction } from "./action";
import type { Entity } from "./entity";

export abstract class AIProfile {
  abstract update(state: GameState, entity: Entity): Action;
}

export class RandomProfile {
  update(state: GameState, entity: Entity): Action {
    let found = false;
    let pos;
    while (!found) {
      const vals = [...Array(4).keys()];
      const dir = RNG.getItem(vals);
      const dirPair = dirMap.get(dir);
      
      pos = {
        x: entity.position.x + dirPair.x,
        y: entity.position.y + dirPair.y,
      };

      if (entity.canMove(pos, state.map)) {
        found = true;
      }
    } 

    return new MoveAction(entity, pos);
  }
}
