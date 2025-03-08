import { RNG, FOV, Path } from "rot-js";
import { dirMap } from "./constants";
import type { GameState } from "./gamestate";
import { NoAction, MoveAction, AttackAction } from "./action";
import { Action } from "./gameEvent";
import { Character } from "./gameObject";
import { Player } from "./player";

export abstract class AIProfile {
  memory: number;
  focus: number;
  seesPlayer: boolean;
  abstract update(state: GameState, character: Character): Action;
}

export class RandomProfile extends AIProfile {
  seesPlayer: boolean = false;
  opensDoors: boolean;

  constructor (opensDoors: boolean = true) {
    super();
    this.opensDoors = opensDoors;
  }

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

      if (character.canMove(pos, state.maps[character.dungeonLevel], this.opensDoors) && 
          !state.entityAt(pos.x, pos.y, character.dungeonLevel)
      ) {
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
 * travels to it. If aware of the player, delegates to subclass.
 */
export abstract class BasicAI extends AIProfile {
  path: Array<{ x: number, y: number }>;
  visionRange: number;
  seesPlayer: boolean;

  constructor(visionRange: number, memory: number) {
    super();
    this.path = [];
    this.visionRange = visionRange;
    this.seesPlayer = false;
    this.memory = memory;
    this.focus = 0;
  }

  updateSeesPlayer(state: GameState, character: Character): void {
    const lightPasses = (x: number, y: number) => {
      return !state.maps[character.dungeonLevel].blocksSight(x, y);
    };
    const fov = new FOV.RecursiveShadowcasting(lightPasses);
    fov.compute(
      character.position.x, 
      character.position.y,
      this.visionRange,
      (x, y, r, visibility) => {
        if (
          x == state.player.position.x && 
          y == state.player.position.y &&
          character.dungeonLevel == state.player.dungeonLevel &&
          !state.player.invisible
        ) {
          this.focus = this.memory;
        }
      }
    );

    this.focus--;

    if (this.focus >= 0) {
      this.seesPlayer = true;
    } else {
      this.seesPlayer = false;
    }
  }

  passable(state: GameState, character: Character, x: number, y: number): boolean {
    const map = state.maps[character.dungeonLevel];
    const entity = state.entityAt(x, y, character.dungeonLevel);
    let blockingEntity;
    if (entity instanceof Player) {
      blockingEntity  = false;
    } else if (entity instanceof Character) {
      blockingEntity = entity == character ? false : true;
    } else {
      blockingEntity = false;
    }
    return map.passable(x, y) && !blockingEntity;
  }

  update(state: GameState, character: Character): Action {
    const map = state.maps[character.dungeonLevel];

    this.updateSeesPlayer(state, character);

    if (!this.seesPlayer) {
      if (this.path.length == 0) {
        let { x, y } = map.openSpot();
        while (x == character.position.x && y == character.position.y) {
          const pos = map.openSpot();
          x = pos.x;
          y = pos.y;
        }
        const dijkstra = new Path.Dijkstra(
          x, 
          y, 
          (x: number, y: number) => this.passable(state, character, x, y), 
          null
        );
        dijkstra.compute(
          character.position.x,
          character.position.y,
          (x: number, y: number) => {
            this.path.push({ x, y });
          }
        );

        this.path.shift();
      } 

      if (this.path.length == 0) {
        return new NoAction();
      }

      const pos = this.path.shift();
      return new MoveAction(character, pos);
    } else {
      return this.seesPlayerAction(state, character);
    }
  }

  abstract seesPlayerAction(state: GameState, character: Character): Action;
}

export class BasicMelee extends BasicAI {
  seesPlayerAction(state: GameState, character: Character): Action {
    const [dist, dir] = d(character.position, state.player.position);
    if (dist <= 2 && character.dungeonLevel == state.player.dungeonLevel) {
      return new AttackAction(character, state.player);
    } else {
      this.path = [];
      const dijkstra = new Path.Dijkstra(
        state.player.position.x, 
        state.player.position.y, 
        (x: number, y: number) => this.passable(state, character, x, y),
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

    if (this.path.length == 0) {
      return new NoAction();
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
