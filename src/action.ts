import { RNG } from "rot-js";
import { Character } from "./gameObject";
import type { GameState } from "./gamestate";
import { GameEntity } from "./gameObject";
import { logMessage } from "./uiManager";

export abstract class Action {
  abstract run(state: GameState): void;
}

export class NoAction extends Action {
  run(state: GameState) {}
}

export class MoveAction extends Action {
  entity: GameEntity;
  position: { x: number; y: number; };

  // No validation for now, need to decide responsibility
  constructor(entity: GameEntity, newPos: {x: number; y: number}) {
    super();
    this.entity = entity;
    this.position = newPos;
  }

  run(state: GameState) {
    const oldPos = this.entity.position;
    this.entity.position = this.position;

    const dl = this.entity.dungeonLevel;
    state.maps[dl].setOpenness(this.position.x, this.position.y, true);
    state.maps[dl].setOpenness(oldPos.x, oldPos.y, false);
  }
}

export class AttackAction extends Action {
  attacker: Character;
  defender: Character;

  constructor(attacker: Character, defender: Character) {
    super();
    this.attacker = attacker;
    this.defender = defender;
  }

  run(state: GameState) {
    const [toHit, dmg] = this.attacker.attack();
    const [dodge, def] = this.defender.defend();

    if (RNG.getPercentage() < toHit - dodge) {
      this.defender.health -= (dmg - def);
      if (this.defender.health <= 0) {
        const i = state.entities.findIndex(e => e == this.defender);
        state.entities.splice(i, 1);
        this.defender.die(state);
      }
      logMessage("Hit");
    } else {
      logMessage("Miss");
    }
  } 
}

export class AscendAction extends Action {
  entity: GameEntity;
  onStair: boolean;

  constructor(entity: GameEntity, onStair: boolean = true) {
    super();
    this.entity = entity;
    this.onStair = onStair;
  }

  run(state: GameState) {
    if (!(this.entity.dungeonLevel > 0)) {
      return;
    }

    this.entity.dungeonLevel -= 1;

    if (this.onStair) {
      const stairPos = state.maps[this.entity.dungeonLevel].stairDown;
      this.entity.position = stairPos;
    }
  }
}

export class DescendAction extends Action {
  entity: GameEntity;
  onStair: boolean;

  constructor(entity: GameEntity, onStair: boolean = true) {
    super();
    this.entity = entity;
    this.onStair = onStair;
  }

  run(state: GameState) {
    if (!(this.entity.dungeonLevel == 10)) {
      return;
    }

    this.entity.dungeonLevel += 1;

    if (this.onStair) {
      const stairPos = state.maps[this.entity.dungeonLevel].stairUp;
      this.entity.position = stairPos;
    }
  }
}
