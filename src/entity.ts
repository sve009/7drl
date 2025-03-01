import { Action } from "./action";
import { Display } from "rot-js";

/**
 * Entities represent anything present on the map with dynamic behavior.
 */
export abstract class Entity {
  // Map position
  position: { x: number; y: number; };

  // Action for turn
  abstract update(): Promise<Action>;

  // Draw entity on the map
  abstract draw(display: Display): void;
}
