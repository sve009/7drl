import * as AI from "./ai";
import { Character } from "./gameObject";
import type { GameState } from "./gamestate";
import type { SightMap } from "./fov";
import type { Action } from "./action";
import { Glyph } from "./renderer";

export class Enemy extends Character {
  position: { x: number; y: number; };
  health: number;
  visible: boolean;
  enemyType: EnemyType;

  constructor(name: string, x: number, y: number) {
    super();
    this.position = { x, y };
    this.visible = false;
    this.enemyType = EnemyTypeFactory.createEnemyType(name);

    this.health = this.enemyType.health;
  }

  async updateState(state: GameState): Promise<Action> {
    const { x, y } = this.position;
    this.visible = state.sightMap.isVisible(x, y);
    return this.enemyType.ai.update(state, this);
  }

  refreshVisuals(sightMap: SightMap) {
    if (this.visible) {
      return new Glyph(
        this.position.x, 
        this.position.y, 
        this.enemyType.symbol, 
        this.enemyType.color, 
        "#000",
      );
    }
    return null;
  }

  attack(): [number, number] {
    return [
      this.enemyType.accuracy,
      this.enemyType.damage,
    ];
  }

  defend(): [number, number] {
    return [
      this.enemyType.dodge,
      this.enemyType.armor,
    ];
  }
}

class EnemyType {
  name: string;
  symbol: string;
  color: string;
  ai: AI.AIProfile;

  health: number;
  accuracy: number;
  damage: number;
  dodge: number;
  armor: number;

  constructor(
    name: string,
    symbol: string,
    color: string,
    ai: AI.AIProfile,
    health: number,
    accuracy: number,
    damage: number,
    dodge: number,
    armor: number,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.color = color;
    this.ai = ai;
    this.health = health;
    this.accuracy = accuracy;
    this.damage = damage;
    this.dodge = dodge;
    this.armor = armor;
  }
}

class EnemyTypeFactory {
  static createEnemyType(name: string): EnemyType {
    switch (name) {
      case "bat": {
        return new EnemyType(
          "bat",
          "b",
          "#ba944e",
          new AI.RandomProfile(),
          5,
          50,
          5,
          50,
          0,
        );
      }
      case "goblin": {
        return new EnemyType(
          "goblin",
          "g",
          "#db4809",
          new AI.BasicMelee(5),
          8,
          50,
          3,
          0,
          0,
        );
      }
    }
  }
}
