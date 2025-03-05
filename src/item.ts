import { GameEntity, Character } from "./gameObject";
import { GameState } from "./gamestate";
import { NoAction } from "./action";
import { Glyph } from "./renderer";

export interface Throwable {
  range: number;
  radius: number;
  throw(x: number, y: number, state: GameState): void;
}

export interface Applyable {
  apply(state: GameState, character: Character): void;
}

export interface Equippable {
  equip(character: Character): void;
  unequip(character: Character): void;
  updateEquipment(): void;
}

export interface Attackable extends Equippable {
  attack(state: GameState, character: Character): [number, number];
}

export interface Defendable extends Equippable {
  defend(state: GameState, character: Character): [number, number];
}

export abstract class Item extends GameEntity {
  name: string;

  async updateState(state: GameState) {
    return new NoAction();
  }
}

export class Potion extends Item implements Throwable, Applyable {
  range: number;
  radius: number;
  profile: PotionProfile;

  constructor(profile: PotionProfile) {
    super();
    this.range = 20;
    this.radius = profile.radius;
    this.profile = profile;
  }

  throw(x: number, y: number, state: GameState) {}
  
  apply(state: GameState, character: Character) {
    this.profile.applied(character);
  }

  refreshVisuals() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "!",
      this.profile.color,
      null,
      true,
    );
  }
}

class PotionProfile {
  name: string;
  radius: number;
  color: string;
  thrown: (entitiesHit: GameEntity[]) => void;
  applied: (character: Character) => void;

  constructor(
    name: string,
    radius: number,
    color: string,
    thrown: (entitiesHit: GameEntity[]) => void,
    applied: (character: Character) => void,
  ) {
    this.name = name;
    this.color = color;
    this.thrown = thrown;
    this.applied = applied;
  }
}

export class Scroll extends Item implements Applyable {
  profile: ScrollProfile;

  constructor(profile: ScrollProfile) {
    super();
    this.profile = profile;
  }

  apply(state: GameState, character: Character) {
    this.profile.applied(state, character);
  }

  refreshVisuals() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "?",
      this.profile.color,
      null,
      true
    );
  }
}

class ScrollProfile {
  name: string;
  color: string;
  applied: (state: GameState, character: Character) => void;

  constructor(
    name: string,
    color: string,
    applied: (state: GameState, character: Character) => void,
  ) {
    this.name = name;
    this.color = color;
    this.applied = applied;
  }
}

export abstract class Weapon extends Item implements Attackable, Equippable {
  equip(character: Character) {
    character.equipment.set("weapon", this);
  }

  unequip(character: Character) {
    character.equipment.set("weapon", null);
  }

  updateEquipment() {}

  refreshVisuals() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "\u{2020}",
      "#ebbf2f",
      null,
      true
    );
  }

  abstract attack(state: GameState, character: Character): [number, number];
}

export abstract class RangedWeapon extends Weapon implements Throwable {
  range: number;
  radius: number;

  abstract throw(x: number, y: number, state: GameState): void;
}

export abstract class Armor extends Item implements Defendable, Equippable {
  equip(character: Character) {
    character.equipment.set("armor", this);
  }

  unequip(character: Character) {
    character.equipment.set("armor", null);
  }

  updateEquipment() {}

  refreshVisuals() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "[",
      "#ebbf2f",
      null,
      true
    );
  }

  abstract defend(state: GameState, character: Character): [number, number];
}

export abstract class Ring extends Item implements Equippable {
  equip(character: Character) {
    character.equipment.set("ring", this);
  }

  unequip(character: Character) {
    character.equipment.set("ring", null);
  }

  abstract updateEquipment(): void;
}

class Gold extends Item {
  amount: number;

  constructor(amount: number) {
    super();
    this.amount = amount;
  }

  refreshVisuals() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "$",
      "#ebbf2f",
      null,
      true
    );
  }
}
