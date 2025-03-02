import * as AI from "./ai";
import { Entity } from "./entity";
import type { GameState } from "./gamestate";
import type { SightMap } from "./fov";
import type { Action } from "./action";
import { Glyph } from "./renderer";

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

  updateColor(sightMap: SightMap) {
    if (this.visible) {
      return { x: this.position.x, y: this.position.y, glyph: new Glyph("b", "#ba944e", "#000")};
    }
    return { x: 0, y: 0, glyph: null };
  }
}
