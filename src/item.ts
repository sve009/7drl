import { RNG } from "rot-js";
import { GameEntity, Character } from "./gameObject";
import { GameState } from "./gamestate";
import { NoAction } from "./action";
import { Glyph } from "./renderer";
import { randi } from "./utilities";
import { Enemy } from "./enemies";
import { RandomProfile } from "./ai";
import { logMessage, getUIManager } from "./uiManager";
import * as Buffs from "./buff";

export interface Throwable {
  range: number;
  radius: number;
  throw(x: number, y: number, state: GameState): void;
}

export interface Applyable {
  apply(state: GameState, character: Character): void;
}

export interface Equippable {
  equippedTo: Character | null;

  equip(character: Character): void;
  unequip(character: Character): void;
  updateEquipment(): void;
}

export interface Attackable extends Equippable {
  attack(state: GameState, character: Character): [number, number];
  onHit(state: GameState, hitter: Character, hit: Character): void; 
}

export interface Defendable extends Equippable {
  defend(state: GameState, character: Character): [number, number];
  wasHit(state: GameState, hit: Character, hitter: Character): void; 
}

export abstract class Item extends GameEntity {
  cost: number;

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
    this.name = profile.name;
    this.cost = 75;
    this.range = 20;
    this.radius = 2;
    this.profile = profile;
  }

  throw(x: number, y: number, state: GameState) {
    const entitiesHit: GameEntity[] = []
    for (const e of state.entities) {
      if (!(e instanceof Character)) {
        continue;
      }
      
      if (e.dungeonLevel != state.player.dungeonLevel) {
        continue;
      }

      if (e.position.x == x && e.position.y == y) {
        entitiesHit.push(e);
      }
    }
    this.profile.thrown(entitiesHit);
  }
  
  apply(state: GameState, character: Character) {
    this.profile.applied(character);
  }

  getGlyph() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "!",
      this.profile.color,
      "#000",
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
export class PotionFactory {
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
              if (entity instanceof Character) {
                entity.addBuff(new Buffs.ConfusionDebuff(15));
                logMessage(`${entity.name} looks confused`);
              }
            }
          },
          (character: Character) => {
            character.addBuff(new Buffs.ConfusionDebuff(20));
            logMessage(`You feel perplexed for a moment, but the feeling passes`);
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
                logMessage(`${entity.name} looks much healthier!`);
              }
            }
          },
          (character: Character) => {
            character.health = character.maxHealth;  
            logMessage("You feel much better!");
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
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                entity.addBuff(new Buffs.RegenerationBuff(5));
                logMessage(`${entity.name}'s wounds start to close`);
              }
            }
          },
          (character: Character) => {
            character.addBuff(new Buffs.RegenerationBuff(25));
            logMessage("Your wounds start to close");
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
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                entity.addBuff(new Buffs.InvisibilityBuff(20));
                logMessage(`${entity.name} disappears!`);
              }
            }
          },
          (character: Character) => {
            character.addBuff(new Buffs.InvisibilityBuff(50));
            logMessage("You can't see yourself anymore!");
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
            logMessage("The potion explodes!");
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                logMessage(`The expolosion hits ${entity.name}!`);
                entity.applyDamage(getUIManager().gameState, 40);
              }
            }
          },
          (character: Character) => {
            // Do something special
            logMessage("You feel uneasy for a moment, then the feeling passes");
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
            for (const entity of entitiesHit) {
              if (entity instanceof Character) {
                entity.addBuff(new Buffs.MightBuff(20));
                logMessage(`${entity.name} looks stronger!`);
              }
            }
          },
          (character: Character) => {
            character.addBuff(new Buffs.MightBuff(50));
            logMessage("You feel mighty!");
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
    this.name = profile.name;
    this.cost = 75;
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
      "#000",
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

const scrollDropTable = {
  teleportation: 1,
  enchantment: 0,
  omniscience: 1,
  poison: 1,
  blinking: 0,
  recall: 0,
  repulsion: 0,
  fire: 0,
};
export class ScrollFactory {
  static getRandomScroll(): Scroll {
    const key = RNG.getWeightedValue(scrollDropTable);
    return ScrollFactory.createScroll(key);
  }

  static createScroll(name: string): Scroll {
    let profile;
    switch (name) {
      case "teleportation": {
        profile = new ScrollProfile(
          "scroll of teleportation",
          "#9e47c9",
          (state: GameState, character: Character) => {
            character.position = state.openSpot(character.dungeonLevel);
            logMessage("We're not in Kansas anymore Toto");
          }
        );
        break;
      }
      case "omniscience": {
        profile = new ScrollProfile(
          "scroll of omniscience",
          "#47c5c9",
          (state: GameState, character: Character) => {
            const z = character.dungeonLevel;
            for (const tile of state.maps[z].tiles) {
              tile.seen = true;
            }
            for (const e of state.entities) {
              e.visibleOverride = e.dungeonLevel == z;
            }
            logMessage("The floor's secrets reveal themselves to you");
          }
        );
        break;
      }
      case "poison": {
        profile = new ScrollProfile(
          "scroll of poison",
          "#35e82e",
          (state: GameState, character: Character) => {
            for (const entity of state.entities) {
              if (entity.dungeonLevel != character.dungeonLevel) {
                continue;
              }
              if (entity instanceof Enemy) {
                if (state.sightMap.isVisible(entity.position.x, entity.position.y)) {
                  entity.addBuff(new Buffs.PoisonDebuff(20));
                }
              }
            }
            logMessage("A toxic aura radiates out from you");
          }
        );
        break;
      }
      default: {
        throw new Error("Unimplemented scroll");
      }
    }
    return new Scroll(profile);
  }
}

export abstract class Weapon extends Item implements Attackable, Equippable {
  equippedTo: Character | null;
  cost: number = 250;

  equip(character: Character) {
    const old = character.equipment.get("weapon");
    if (old) {
      old.unequip(character);
    }

    character.equipment.set("weapon", this);
    this.equippedTo = character;

    logMessage(`Equipped ${this.name}`);
  }

  unequip(character: Character) {
    character.equipment.set("weapon", null);
    this.equippedTo = null;

    logMessage(`Unequipped ${this.name}`);
  }

  onHit(state: GameState, hitter: Character, hit: Character) {}

  updateEquipment() {}

  getGlyph() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "\u{2020}",
      "#ebbf2f",
      "#000",
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
  equippedTo: Character | null;
  cost: number = 250;

  equip(character: Character) {
    const old = character.equipment.get("armor");
    if (old) {
      old.unequip(character);
    }

    character.equipment.set("armor", this);
    this.equippedTo = character;

    logMessage(`Equipped ${this.name}`);
  }

  unequip(character: Character) {
    character.equipment.set("armor", null);
    this.equippedTo = null;

    logMessage(`Unequipped ${this.name}`);
  }

  wasHit(state: GameState, hit: Character, hitter: Character) {}

  updateEquipment() {}

  getGlyph() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "[",
      "#ebbf2f",
      "#000",
      true
    );
  }

  abstract defend(state: GameState, character: Character): [number, number];
}

export abstract class Ring extends Item implements Equippable {
  equippedTo: Character;

  equip(character: Character) {
    const old = character.equipment.get("ring");
    if (old) {
      old.unequip(character);
    }

    character.equipment.set("ring", this);
    this.equippedTo = character;

    logMessage(`Equipped ${this.name}`);
  }

  unequip(character: Character) {
    character.equipment.set("ring", null);
    this.equippedTo = null;

    logMessage(`Unequipped ${this.name}`);
  }

  abstract updateEquipment(): void;
}

export class Gold extends Item {
  amount: number;

  constructor(amount: number) {
    super();
    this.amount = amount;
    this.name = `${amount} gold`;
  }

  getGlyph() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "$",
      "#ebbf2f",
      "#000",
      true
    );
  }
}

export class Artifact extends Item {
  constructor() {
    super();
    this.name = "mysterious artifact";
  }

  getGlyph() {
    return new Glyph(
      this.position.x,
      this.position.y,
      "\u{26db}",
      "#fcc90f",
      "#31233b",
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

const weaponTable = {
  dagger: 8,
  spear: 5,
  sword: 3,
  axe: 2,
  glaive: 1,
};
const armorTable = {
  leather: 8,
  chain: 5,
  scale: 3,
  plate: 2,
}
export class BasicWeaponArmorFactory {
  static createRandomBasicWeapon(): BasicWeapon {
    const profile = RNG.getWeightedValue(weaponTable);
    return BasicWeaponArmorFactory.createBasicWeapon(profile);
  }

  static createRandomBasicArmor(): BasicArmor {
    const profile = RNG.getWeightedValue(armorTable);
    return BasicWeaponArmorFactory.createBasicArmor(profile);
  }

  static createBasicWeapon(name: string): BasicWeapon {
    let profile;
    switch (name) {
      case "dagger": {
        profile = new BasicWeaponProfile(
          name,
          10,
          1
        );
        break;
      }
      case "spear": {
        profile = new BasicWeaponProfile(
          name,
          20,
          1
        );
        break;
      }
      case "sword": {
        profile = new BasicWeaponProfile(
          name,
          20,
          3
        );
        break;
      }
      case "axe": {
        profile = new BasicWeaponProfile(
          name,
          10,
          5
        );
        break;
      }
      case "glaive": {
        profile = new BasicWeaponProfile(
          name,
          30,
          7
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
          1,
        );
        break;
      }
      case "chain": {
        profile = new BasicArmorProfile(
          "chain mail",
          15,
          2,
        );
        break;
      }
      case "scale": {
        profile = new BasicArmorProfile(
          "scale mail",
          15,
          3,
        );
        break;
      }
      case "plate": {
        profile = new BasicArmorProfile(
          "plate armor",
          10,
          4,
        );
        break;
      }
    }
    return new BasicArmor(profile);
  }
}

const itemTable = {
  potion: 45,
  scroll: 20,
  gold: 20,
  equipment: 15,
};
const equipmentTable = {
  weapon: 60,
  armor: 40,
}
export class ItemGenerator {
  static createItem(dungeonLevel: number): Item {
    let key = RNG.getWeightedValue(itemTable);
    switch (key) {
      case "potion": {
        return PotionFactory.getRandomPotion();
      }
      case "scroll": {
        return ScrollFactory.getRandomScroll();
      }
      case "gold": {
        const amount = randi(60, 151);
        return new Gold(amount);
      }
      case "equipment": {
        switch (RNG.getWeightedValue(equipmentTable)) {
          case "weapon": {
            const wep = RNG.getWeightedValue(weaponTable);
            return BasicWeaponArmorFactory.createBasicWeapon(wep);
          }
          case "armor": {
            const arm = RNG.getWeightedValue(armorTable);
            return BasicWeaponArmorFactory.createBasicArmor(arm);
          }
        }
      }
    }
  }
}
