import * as AI from "./ai";
import { Character } from "./entity";
import type { GameState } from "./gamestate";
import type { SightMap } from "./fov";
import type { Action } from "./action";
import { Glyph } from "./renderer";

export abstract class Enemy extends Character {
  protected ai: AI.AIProfile;
  protected visible: boolean;
}

export class Bat extends Enemy {
  constructor(x: number, y: number) {
    super();
    this.position = { x, y };
    this.health = 5;
    this.ai = new AI.RandomProfile();
  }

  async update(state: GameState): Promise<Action> {
    const { x, y } = this.position;
    this.visible = state.sightMap.isVisible(x, y);
    return this.ai.update(state, this);
  }

  updateColor(sightMap: SightMap) {
    if (this.visible) {
      return new Glyph(this.position.x, this.position.y, "b", "#ba944e", "#000");
    }
    return null;
  }

  attack(): [number, number] {
    return [50, 10];
  }

  defend(): [number, number] {
    return [50, 0];
  }
}

export class Goblin extends Enemy {
  constructor(x: number, y: number) {
    super();
    this.position = { x, y };
    this.health = 8;
    this.ai = new AI.BasicMelee(5);
  }

  async update(state: GameState): Promise<Action> {
    const { x, y } = this.position;
    this.visible = state.sightMap.isVisible(x, y);
    return this.ai.update(state, this);
  }

  updateColor(sightMap: SightMap) {
    if (this.visible) {
      return new Glyph(this.position.x, this.position.y, "g", "#db4809", "#000");
    }
    return null;
  }

  attack(): [number, number] {
    return [50, 3];
  }

  defend(): [number, number] {
    return [0, 0];
  }
}
