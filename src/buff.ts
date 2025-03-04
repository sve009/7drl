import type { Character } from "./gameObject";
import type { GameState } from "./gamestate";
import { AIProfile, RandomProfile } from "./ai";
import { Player } from "./player";
import { Enemy } from "./enemies";
import { Attackable, Defendable } from "./item";

export abstract class Buff implements Attackable, Defendable {
  name: string;
  turnsRemaining: number;

  abstract update(state: GameState, character: Character): void;
  end(character: Character): void {}

  // Hacky
  equip(character: Character) {}
  unequip(character: Character) {}
  updateEquipment() {}

  // Attackable
  attack(state: GameState, character: Character): [number, number] {
    return [0, 0];
  }
  onHit(state: GameState, hitter: Character, hit: Character) {} 

  // Defendable
  defend(state: GameState, character: Character): [number, number] {
    return [0, 0];
  }
  wasHit(state: GameState, hit: Character, hitter: Character) {} 
}

export class ConfusionDebuff extends Buff {
  originalAI?: AIProfile;

  constructor(turns: number) {
    super();
    this.name = "confusion";
    this.turnsRemaining = turns;
  }

  update(state: GameState, character: Character) {
    if (character instanceof Player) {
      // Unimplemented
      return;
    }

    if (!this.originalAI && character instanceof Enemy) {
      this.originalAI = character.enemyType.ai;
      character.enemyType.ai = new RandomProfile(); 
    }
  }

  end(character: Character) {
    if (character instanceof Enemy) {
      character.enemyType.ai = this.originalAI;
    }
  }
}

export class RegenerationBuff extends Buff {
  constructor(turns: number) {
    super();
    this.name = "regeneration";
    this.turnsRemaining = turns;
  }

  update(state: GameState, character: Character) {
    // + 2 for now
    character.health = Math.min(
      character.maxHealth, 
      Math.ceil(character.maxHealth / 10)
    );
  }
}

export class MightBuff extends Buff {
  constructor(turns: number) {
    super();
    this.name = "might";
    this.turnsRemaining = turns;
  }

  update(state: GameState, character: Character) {}

  attack(state: GameState, character: Character): [number, number] {
    return [40, 2];
  }
}

export class InvisibilityBuff extends Buff {
  constructor(turns: number) {
    super();
    this.name = "invisibility";
    this.turnsRemaining = turns;
  }

  update(state: GameState, character: Character) {
    if (character instanceof Player) {
      for (const entity of state.entities) {
        if (entity instanceof Enemy) {
          entity.enemyType.ai.seesPlayer = false;
        }
      }
    } else {
      character.invisible = true;
    }
  }

  end(character: Character) {
    character.invisible = false;
  }
}

export class PoisonDebuff extends Buff {
  constructor(turns: number) {
    super();
    this.name = "poison";
    this.turnsRemaining = turns;
  }

  update(state: GameState, character: Character) {
    character.health -= Math.ceil(character.maxHealth / 25);
  }
}

export class SpeedBuff extends Buff {
  constructor(turns: number) {
    super();
    this.name = "speed";
    this.turnsRemaining = turns;
  }

  // TODO
  update(state: GameState, character: Character) {}
}

