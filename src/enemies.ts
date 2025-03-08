import { RNG, Path } from "rot-js";
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
          "d",
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
          "d",
          "#bd0d0d",
          new AI.BasicMelee(8, 5),
          15,
          60,
          4,
          10,
          0,
        );
      }
      case "cavespider": {
        return new EnemyType(
          "cave spider",
          "s",
          "#17f013",
          new AI.BasicMelee(7, 3),
          8,
          60,
          6,
          60,
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
  },

  // Level 4
  {
    bat: 20,
    wolf: 35,
    goblinarcher: 25,
    cavespider: 20,
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
    const dijkstra = new Path.Dijkstra(
      state.player.position.x,
      state.player.position.y,
      (x: number, y: number) => {
        return state.maps[z].passable(x, y);
      },
      null
    );

    let dist = 0;
    let count = 0;
    let position = state.player.position;
    while (dist < 12 && count < 10) {
      count++;

      dist = 0;
      position = state.openSpot(z);
      dijkstra.compute(
        position.x,
        position.y,
        (x: number, y: number) => { dist++; },
      );
    }

    const enemy = new Enemy(key, position.x, position.y, z);
    state.entities.push(enemy);
  }
}
