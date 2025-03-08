import { RNG } from "rot-js";
import * as AI from "./ai";
import { Character } from "./gameObject";
import type { GameState } from "./gamestate";
import type { Action } from "./gameEvent";
import { Glyph } from "./renderer";
import { randi } from "./utilities";

export class Enemy extends Character {
  position: { x: number; y: number; };
  maxHealth: number;
  health: number;
  visible: boolean;
  enemyType: EnemyType;

  constructor(name: string, x: number, y: number, z: number) {
    super();
    this.position = { x, y };
    this.dungeonLevel = z;
    this.visible = false;

    this.enemyType = EnemyTypeFactory.createEnemyType(name);
    this.name = this.enemyType.name;
    
    this.maxHealth = this.enemyType.health;
    this.health = this.maxHealth;

    this.accuracy = this.enemyType.accuracy;
    this.damage = this.enemyType.damage;
    this.dodge = this.enemyType.dodge;
    this.armor = this.enemyType.armor;
  }

  async updateState(state: GameState): Promise<Action> {
    const { x, y } = this.position;
    this.visible = state.sightMap.isVisible(x, y);
    return this.enemyType.ai.update(state, this);
  }

  getGlyph() {
    return new Glyph(
      this.position.x, 
      this.position.y, 
      this.enemyType.symbol, 
      this.enemyType.color, 
      "#000",
    );
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
      case "shopkeeper": {
        return new EnemyType(
          "shopkeeper",
          "@",
          "#fff",
          new AI.RandomProfile(false, true),
          5,
          50,
          5,
          5,
          5,
        );
      }
      case "priest": {
        return new EnemyType(
          "priest",
          "@",
          "#fa73e1",
          new AI.RandomProfile(false, true),
          5,
          50,
          5,
          5,
          5,
        );
      }
      case "bat": {
        return new EnemyType(
          "bat",
          "b",
          "#ba944e",
          new AI.BasicMelee(10, 5),
          3,
          35,
          1,
          50,
          0,
        );
      }
      case "jackal": {
        return new EnemyType(
          "jackal",
          "j",
          "#c7a06d",
          new AI.BasicMelee(7, 4),
          5,
          35,
          2,
          0,
          0,
        );
      }
      case "goblin": {
        return new EnemyType(
          "goblin",
          "g",
          "#db4809",
          new AI.BasicMelee(5, 3),
          5,
          60,
          3,
          0,
          0,
        );
      }
      case "goblinarcher": {
        return new EnemyType(
          "goblin archer",
          "g",
          "#035efc",
          new AI.BasicRanged(8, 6),
          3,
          50,
          2,
          0,
          0,
        );
      }
      case "wolf": {
        return new EnemyType(
          "wolf",
          "j",
          "#bd0d0d",
          new AI.BasicMelee(8, 5),
          15,
          60,
          6,
          10,
          0,
        );
      }
    }
  }
}

const enemyTables = [
  // Level 0
  {},

  // Level 1
  {
    goblin: 30,
    bat: 30,
    jackal: 40,
  },

  // Level 2
  {
    goblin: 40,
    bat: 30,
    jackal: 20,
    goblinarcher: 10,
  },

  // Level 3
  {
    goblin: 30,
    bat: 20,
    jackal: 10,
    goblinarcher: 25,
    wolf: 15,
  }
];
export class EnemyGenerator {
  static createEnemyGroup(state: GameState, z: number) {
    let tableIndex = z;
    if (tableIndex >= enemyTables.length) {
      tableIndex = enemyTables.length - 1;
    }
    const enemyTable = enemyTables[tableIndex];
    const key = RNG.getWeightedValue(enemyTable);     
    const position = state.openSpot(z);
    const enemy = new Enemy(key, position.x, position.y, z);
    state.entities.push(enemy);
  }
}
