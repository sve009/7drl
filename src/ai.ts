import { RNG, FOV, Path } from "rot-js";
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

/**
 * If unaware of the player, picks a random spot on the map and
 * travels to it. If aware of the player, approaches and attacks the player.
 */
export class BasicMelee {
  path: Array<{ x: number, y: number }>;
  visionRange: number;
  seesPlayer: boolean;

  constructor(visionRange: number) {
    this.path = [];
    this.visionRange = visionRange;
    this.seesPlayer = false;
  }

  update(state: GameState, character: Character): Action {
    const lightPasses = (x: number, y: number) => {
      return !state.map.blocksSight(x, y);
    };
    const passable = (x: number, y: number) => {
      return state.map.passable(x, y);
    }
    const fov = new FOV.RecursiveShadowcasting(lightPasses);
    fov.compute(
      character.position.x, 
      character.position.y,
      this.visionRange,
      (x, y, r, visibility) => {
        if (x == state.player.position.x && y == state.player.position.y) {
          this.seesPlayer = true;
        }
      }
    );

    if (!this.seesPlayer) {
      if (this.path.length == 0) {
        const { x, y } = state.map.openSpot();
        const dijkstra = new Path.Dijkstra(x, y, passable, null);
        dijkstra.compute(
          character.position.x,
          character.position.y,
          (x: number, y: number) => {
            this.path.push({ x, y });
          }
        );
        
        // Throw away current square
        this.path.shift();
      } 
    } else {
      const [dist, dir] = d(character.position, state.player.position);
      if (dist < 2) {
        return new AttackAction(character, state.player);
      } else {
        this.path = [];
        const dijkstra = new Path.Dijkstra(
          state.player.position.x, 
          state.player.position.y, 
          passable,
          null
        );
        dijkstra.compute(
          character.position.x,
          character.position.y,
          (x: number, y: number) => {
            this.path.push({ x, y });
          }
        );

        // Throw away current square
        this.path.shift()
      }
    }

    const pos = this.path.shift();
    return new MoveAction(character, pos);
  }
}

function d(
  p1: { x: number, y: number }, 
  p2: { x: number, y: number }
): [number, number] {
  const dist = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);

  let dir;
  if (p2.x - p1.x > 0) {
    if (p2.y - p1.y > 0) {
      dir = 5;
    } else if (p2.y - p1.y == 0) {
      dir = 2;
    } else {
      dir = 6;
    }
  } else if (p2.x - p1.x == 0) {
    if (p2.y - p1.y > 0) {
      dir = 1;
    } else if (p2.y - p1.y == 0) {
      dir = -1;
    } else {
      dir = 3;
    }
  } else {
    if (p2.y - p1.y > 0) {
      dir = 4;
    } else if (p2.y - p1.y == 0) {
      dir = 0;
    } else {
      dir = 7;
    }
  }

  return [dist, dir];
}
