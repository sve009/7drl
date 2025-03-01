import { Entity } from "./entity";

export abstract class Action {
  abstract run(): void;
}

export class NoAction extends Action {
  run() {}
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

  run() {
    this.entity.position = this.position;
  }
}

