import type { Display } from "rot-js";
import * as AI from "./ai";
import { Entity } from "./entity";
import type { GameState } from "./gamestate";
import type { Action } from "./action";

export abstract class Enemy extends Entity {
  protected ai: AI.AIProfile;
  protected visible: boolean;
}

export class Bat extends Enemy {
  constructor(x: number, y: number) {
    super();
    this.position = { x, y };
    this.ai = new AI.RandomProfile();
  }

  async update(state: GameState): Promise<Action> {
    const { x, y } = this.position;
    this.visible = state.sightMap.isVisible(x, y);
    return this.ai.update(state, this);
  }

  draw(display: Display): void {
    if (this.visible) {
      display.draw(
        this.position.x,
        this.position.y,
        "b",
        "#ba944e",
        "#000"
      );
    }
  }
}
