import { Action } from "./Action"

/**
 * Entities represent anything present on the map with dynamic behavior.
 */
export abstract class Entity {
  // Map position
  position: {x: number, y: number};

  // Action for turn
  abstract update(): Action;
}
