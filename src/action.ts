import { RNG } from "rot-js";
import { Character } from "./gameObject";
import { GameState, GameMap } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { GameEntity } from "./gameObject";
import { Player } from "./player";
import { logMessage } from "./uiManager";
import { Item, Gold, Artifact, ItemGenerator, Applyable, Equippable, Throwable } from "./item";
import { EnemyGenerator } from "./enemies";
import { randi } from "./utilities";
import { Action } from "./gameEvent";
import { dirMap } from "./constants";

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

export class ApplyAction extends Action {
  item: Applyable;

  constructor(item: Applyable) {
    super();
    this.item = item;
  }

  run(state: GameState) {
    // TODO: let enemies use items
    this.item.apply(state, state.player);  
  }
}

export class EquipAction extends Action {
  item: Equippable;

  constructor(item: Equippable) {
    super();
    this.item = item;
  }

  run(state: GameState) {
    // TODO: let enemies equip / unequip
    if (this.item.equippedTo) {
      this.item.unequip(state.player);
    } else {
      this.item.equip(state.player);
    }
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
      const dmgTkn = Math.max(1, dmg - def);
      logMessage(`${this.attacker.name} hits ${this.defender.name} for ${dmgTkn} damage`);
      this.defender.applyDamage(state, dmgTkn);
    } else {
      logMessage(`${this.attacker.name} misses ${this.defender.name}`);
    }
  } 
}

export class ThrowAction extends Action {
  item: Throwable;
  position: { x: number, y: number };

  constructor(item: Throwable, position: { x: number, y: number }) {
    super();
    this.item = item;
    this.position = position;
  }

  run(state: GameState) {
    const { x, y } = this.position;
    this.item.throw(x, y, state);
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

          // Bad bad bad bad
          if (entity instanceof Gold) {
            (this.character as Player).gold += entity.amount;
          } else if (entity instanceof Artifact) { 
            this.character.position = {
              x: 26,
              y: 3,
            };
            this.character.dungeonLevel = 0;
            (this.character as Player).artifacts++;

            logMessage("The world spins around you");

            return;
          } else {
            this.character.items.addItem(entity);
          }
          logMessage(`Picked up ${entity.name}`);
        }
      }
    }
  }
}

export class DropAction extends Action {
  item: Item;

  constructor(item: Item) {
    super();
    this.item = item;
  }

  run(state: GameState) {
    // Only the player for now
    this.item.position = state.player.position;
    this.item.dungeonLevel = state.player.dungeonLevel;
    state.entities.push(this.item);
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
  level: number;

  constructor(entity: GameEntity, onStair: boolean = true, level = -1) {
    super();
    this.entity = entity;
    this.onStair = onStair;
    this.level = level;
  }

  run(state: GameState) {
    if (this.level > 0) {
      this.entity.dungeonLevel = this.level;
      this.entity.position = state.openSpot(this.level);
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
      generator.generateLevel(state, this.entity.dungeonLevel);
      

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
      for (let i = 0; i < randi(5, 9); i++) {
        EnemyGenerator.createEnemyGroup(state, this.entity.dungeonLevel);
      }
    }

    if (this.onStair) {
      const stairPos = state.maps[this.entity.dungeonLevel].stairUp;
      this.entity.position = stairPos;
    }
  }
}
