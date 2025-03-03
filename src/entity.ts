import type { GameState, GameMap } from "./gamestate";
import type { SightMap } from "./fov";
import type { Action } from "./action";
import { Glyph } from "./renderer";

/**
 * Entities represent anything present on the map with dynamic behavior.
 */
export abstract class Entity {
  // Map position
  position: { x: number; y: number; };

  // Action for turn
  abstract update(state: GameState): Promise<Action>;

  // Draw entity on the map
  abstract updateColor(sightMap: SightMap): Glyph | null;

  canMove(position: { x: number; y: number; }, map: GameMap): boolean {
    return map.passable(position.x, position.y);
  }
}

export abstract class Character extends Entity {
  health: number;

  abstract attack(): [number, number];
  abstract defend(): [number, number];

  die(state: GameState): void {}
} 
