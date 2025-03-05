import { RNG } from "rot-js";
import { GameEntity, Character } from "./gameObject";
import { GameState } from "./gamestate";
import { NoAction } from "./action";
import { Glyph } from "./renderer";
import { randi } from "./utilities";
import { Enemy } from "./enemies";
import { RandomProfile } from "./ai";

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

  getGlyph() {
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

const potionDropTable = {
  confusion: 1,
  healing: 1,
  regen: 1,
  invis: 1,
  explosive: 1,
  phasing: 0,
  might: 1,
  fireres: 0,
  poisonres: 0,
  coldres: 0,
  speed: 0,
  weakness: 0,
  warding: 0
};
class PotionFactory {
  static getRandomPotion(): Potion {
    const key = RNG.getWeightedValue(potionDropTable);
    return PotionFactory.createPotion(key);
  }

  static createPotion(name: string): Potion {
    let profile;
    switch (name) {
      case "confusion": {
        profile = new PotionProfile(
          "potion of confusion",
          2,
          "#d4ac1c",
          (entitiesHit: GameEntity[]) => {
            for (const entity of entitiesHit) {
              // To do, handle player being hit
              if (entity instanceof Enemy) {
                // To do, debuff timer so it's not permanent
                entity.enemyType.ai = new RandomProfile();
              }
            }
          },
          (character: Character) => {
            // Implemented when debuffs exist
          }
        );
        break;
      }
      case "healing": {
        profile = new PotionProfile(
          "potion of healing",
          2,
          "#1ca9d4",
          (entitiesHit: GameEntity[]) => {
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                entity.health = entity.maxHealth;
              }
            }
          },
          (character: Character) => {
            character.health = character.maxHealth;  
          }
        );
        break;
      }
      case "regen": {
        profile = new PotionProfile(
          "potion of regeneration",
          2,
          "#d41c71",
          (entitiesHit: GameEntity[]) => {
            // To do when buffs added
          },
          (character: Character) => {
            // To do when buffs added
          }
        );
        break;
      }
      case "invis": {
        profile = new PotionProfile(
          "potion of invisibility",
          1,
          "#07357d",
          (entitiesHit: GameEntity[]) => {
            // To do when buffs added
          },
          (character: Character) => {
            // To do when buffs added
          }
        );
        break;
      }
      case "explosive": {
        profile = new PotionProfile(
          "unstable potion",
          4,
          "#fc0303",
          (entitiesHit: GameEntity[]) => {
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                entity.health -= 10;
              }
            }
          },
          (character: Character) => {
            // Do something special
          }
        );
        break;
      }
      case "might": {
        profile = new PotionProfile(
          "potion of might",
          1,
          "#47c949",
          (entitiesHit: GameEntity[]) => {
            // TODO buffs
          },
          (character: Character) => {
            // TODO buffs
          }
        );
        break;
      }
      default: {
        throw new Error("Unimplemented potion");
      }
    }
    return new Potion(profile);
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

  getGlyph() {
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

  getGlyph() {
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

  getGlyph() {
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

  getGlyph() {
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

export class BasicWeapon extends Weapon {
  profile: BasicWeaponProfile;

  constructor(profile: BasicWeaponProfile) {
    super();
    this.name = profile.name;
    this.profile = profile;
  }

  attack(state: GameState, character: Character): [number, number] {
    return [
      this.profile.accuracy,
      this.profile.damage,
    ];
  }
}

class BasicWeaponProfile {
  name: string;
  accuracy: number;
  damage: number;

  constructor(
    name: string,
    accuracy: number,
    damage: number,
  ) {
    this.name = name;
    this.accuracy = accuracy;
    this.damage = damage;
  }
}

export class BasicArmor extends Armor {
  profile: BasicArmorProfile
  
  constructor(profile: BasicArmorProfile) {
    super();
    this.name = profile.name;
    this.profile = profile;
  }

  defend(state: GameState, character: Character): [number, number] {
    return [
      this.profile.dodge,
      this.profile.armor,
    ];
  }
}

class BasicArmorProfile {
  name: string;
  dodge: number;
  armor: number;

  constructor(
    name: string,
    dodge: number,
    armor: number,
  ) {
    this.name = name;
    this.dodge = dodge;
    this.armor = armor;
  }
}

class BasicWeaponArmorFactory {
  static createBasicWeapon(name: string): BasicWeapon {
    let profile;
    switch (name) {
      case "dagger": {
        profile = new BasicWeaponProfile(
          name,
          50,
          2
        );
        break;
      }
      case "spear": {
        profile = new BasicWeaponProfile(
          name,
          50,
          2
        );
        break;
      }
      case "sword": {
        profile = new BasicWeaponProfile(
          name,
          70,
          4
        );
        break;
      }
      case "axe": {
        profile = new BasicWeaponProfile(
          name,
          50,
          8
        );
        break;
      }
      case "glaive": {
        profile = new BasicWeaponProfile(
          name,
          80,
          8
        );
        break;
      }
    }
    return new BasicWeapon(profile);
  }

  static createBasicArmor(name: string): BasicArmor {
    let profile;
    switch (name) {
      case "leather": {
        profile = new BasicArmorProfile(
          "leather armor",
          20,
          2,
        );
        break;
      }
      case "chain": {
        profile = new BasicArmorProfile(
          "chain mail",
          15,
          4,
        );
        break;
      }
      case "scale": {
        profile = new BasicArmorProfile(
          "scale mail",
          15,
          5,
        );
        break;
      }
      case "plate": {
        profile = new BasicArmorProfile(
          "plate armor",
          10,
          7,
        );
        break;
      }
    }
    return new BasicArmor(profile);
  }
}

export class ItemGenerator {
  /**
   * TODO put this in a table Sam you animal.
   *   -- Only equipment will scale with depth
   *
   * Split:
   * - 40% Potions
   * - 20% Scrolls
   * - 20% Gold
   * - 20% Equipment
   *   - 60% Basic equipment
   *   - 40% Special equipment (not yet implemented)
   */
  static createItem(dungeonLevel: number): Item {
    let p = RNG.getPercentage();
    if (p < 40) {
      return PotionFactory.getRandomPotion();
    } else if (p < 60) {
      return new Gold(50);
    } else if (p < 80) {
      p = RNG.getPercentage();
      if (p < 60) {
        const options = ["dagger", "spear", "sword", "axe", "glaive"];
        const opt = RNG.getItem(options);
        return BasicWeaponArmorFactory.createBasicWeapon(opt);
      } else {
        const options = ["leather", "chain", "scale", "plate"];
        const opt = RNG.getItem(options);
        return BasicWeaponArmorFactory.createBasicArmor(opt);
      }
    } else {
      const amount = randi(60, 151);
      return new Gold(amount);
    }
  }
}
