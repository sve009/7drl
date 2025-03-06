import { RNG } from "rot-js";
import { Character } from "./gameObject";
import { GameState, GameMap } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { GameEntity } from "./gameObject";
import { logMessage } from "./uiManager";
import { Item, ItemGenerator } from "./item";
import { EnemyGenerator } from "./enemies";
import { randi } from "./utilities";
import { Action } from "./gameEvent";

export class NoAction extends Action {
  run(state: GameState) {}
}

export class MoveAction extends Action {
  entity: GameEntity;
  position: { x: number; y: number; };

  // No validation for now, need to decide responsibility
  constructor(entity: GameEntity, newPos: {x: number; y: number}) {
    super();
    this.entity = entity;
    this.position = newPos;
  }

  run(state: GameState) {
    const oldPos = this.entity.position;
    this.entity.position = this.position;

    const dl = this.entity.dungeonLevel;
    state.maps[dl].setOpenness(this.position.x, this.position.y, true);
    state.maps[dl].setOpenness(oldPos.x, oldPos.y, false);
  }
}

export class AttackAction extends Action {
  attacker: Character;
  defender: Character;

  constructor(attacker: Character, defender: Character) {
    super();
    this.attacker = attacker;
    this.defender = defender;
  }

  run(state: GameState) {
    const [toHit, dmg] = this.attacker.attack(state);
    const [dodge, def] = this.defender.defend(state);

    if (RNG.getPercentage() < toHit - dodge) {
      this.defender.health -= (dmg - def);
      logMessage(`${this.attacker.name} hit ${this.defender.name} for ${dmg} damage`);
      if (this.defender.health <= 0) {
        const i = state.entities.findIndex(e => e == this.defender);
        state.entities.splice(i, 1);
        logMessage(`${this.attacker.name} killed ${this.defender.name}`);
        this.defender.die(state);
      }
    } else {
      logMessage(`${this.attacker.name} missed ${this.defender.name}`);
    }
  } 
}

export class PickUpAction extends Action {
  character: Character;

  constructor (character: Character) {
    super();
    this.character = character;
  }

  run(state: GameState) {
    for (let i = 0; i < state.entities.length; i++) {
      const entity = state.entities[i];
      if (entity instanceof Item) {
        const { x, y } = entity.position;
        if (
          x == this.character.position.x &&
          y == this.character.position.y &&
          entity.dungeonLevel == this.character.dungeonLevel
        ) {
          state.entities.splice(i, 1);
          this.character.items.addItem(entity);
        }
      }
    }
  }
}

export class AscendAction extends Action {
  entity: GameEntity;
  onStair: boolean;

  constructor(entity: GameEntity, onStair: boolean = true) {
    super();
    this.entity = entity;
    this.onStair = onStair;
  }

  run(state: GameState) {
    if (!(this.entity.dungeonLevel > 0)) {
      return;
    }

    this.entity.dungeonLevel -= 1;

    if (this.onStair) {
      const stairPos = state.maps[this.entity.dungeonLevel].stairDown;
      this.entity.position = stairPos;
    }
  }
}

export class DescendAction extends Action {
  entity: GameEntity;
  onStair: boolean;

  constructor(entity: GameEntity, onStair: boolean = true) {
    super();
    this.entity = entity;
    this.onStair = onStair;
  }

  run(state: GameState) {
    if (this.entity.dungeonLevel == 10) {
      return;
    }

    this.entity.dungeonLevel += 1;

    if (this.entity.dungeonLevel > state.maps.length - 1) {
      const map = new GameMap(state.boundaries);
      state.maps.push(map);
      const generator = new MapGenerator(
        state.boundaries.width, 
        state.boundaries.height, 
        map
      );
      generator.generateLevel();

      // Code is here temporarily

      // Items
      // 5 Guaranteed
      for (let i = 0; i < 5; i++) {
        const pos = state.openSpot(this.entity.dungeonLevel);
        const item = ItemGenerator.createItem(this.entity.dungeonLevel); 
        item.position = pos;
        item.dungeonLevel = this.entity.dungeonLevel;
        state.entities.push(item);
      }

      const chance = 50;
      let run = true;
      while (run) {
        const p = RNG.getPercentage();
        if (p < chance) {
          const pos = state.openSpot(this.entity.dungeonLevel);
          const item = ItemGenerator.createItem(this.entity.dungeonLevel); 
          item.position = pos;
          item.dungeonLevel = this.entity.dungeonLevel;
          state.entities.push(item);
        } else {
          run = false;
        }
      }

      // Enemies
      // 6 Guaranteed
      for (let i = 0; i < randi(6, 11); i++) {
        EnemyGenerator.createEnemyGroup(state, this.entity.dungeonLevel);
      }
    }

    if (this.onStair) {
      const stairPos = state.maps[this.entity.dungeonLevel].stairUp;
      this.entity.position = stairPos;
    }
  }
}
