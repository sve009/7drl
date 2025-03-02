import { RNG } from "rot-js";
import { dirMap } from "./constants";
import type { GameState } from "./gamestate";
import { Action, MoveAction, AttackAction } from "./action";
import type { Character } from "./entity";

export abstract class AIProfile {
  abstract update(state: GameState, character: Character): Action;
}

export class RandomProfile {
  update(state: GameState, character: Character): Action {
    let found = false;
    let pos;
    while (!found) {
      const vals = [...Array(4).keys()];
      const dir = RNG.getItem(vals);
      const dirPair = dirMap.get(dir);
      
      pos = {
        x: character.position.x + dirPair.x,
        y: character.position.y + dirPair.y,
      };

      if (character.canMove(pos, state.map) && !state.entityAt(pos.x, pos.y)) {
        found = true;
      } else if (pos.x == state.player.position.x && pos.y == state.player.position.y) {
        return new AttackAction(character, state.player);
      }
    } 

    return new MoveAction(character, pos);
  }
}
