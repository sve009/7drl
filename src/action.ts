import { RNG } from "rot-js";
import { Entity, Character } from "./entity";
import type { GameState } from "./gamestate";

export abstract class Action {
  abstract run(state: GameState): void;
}

export class NoAction extends Action {
  run(state: GameState) {}
}

export class MoveAction extends Action {
  entity: Entity;
  position: { x: number; y: number; };

  // No validation for now, need to decide responsibility
  constructor(entity: Entity, newPos: {x: number; y: number}) {
    super();
    this.entity = entity;
    this.position = newPos;
  }

  run(state: GameState) {
    console.log('position', this.position);
    const oldPos = this.entity.position;
    this.entity.position = this.position;

    state.map.setOpenness(this.position.x, this.position.y, true);
    state.map.setOpenness(oldPos.x, oldPos.y, false);
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
    }
  } 
}

