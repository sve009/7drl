import { Entity } from "./entity";
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
    const oldPos = this.entity.position;
    this.entity.position = this.position;

    state.map.setOpenness(this.position.x, this.position.y, true);
    state.map.setOpenness(oldPos.x, oldPos.y, false);
  }
}

