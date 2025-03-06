import { Action } from "./action";
import { SightMap } from "./fov";
import { GameMap, GameState } from "./gamestate";
import { Item, Equippable, Attackable, Defendable } from "./item";
import { Drawable, getRenderer, Layer, Position, Glyph } from "./renderer";
import { Buff } from "./buff";

abstract class GameObject {}

type EquipSlot = [string, Equippable | null];

const equipSlots: EquipSlot[] = [
  ["weapon", null],
  ["armor", null],
  ["ring", null],
];

export abstract class GameEntity extends GameObject{
  position: { x: number; y: number; };
  dungeonLevel: number;

  visible: boolean;
  invisible: boolean = false;

  abstract updateState(state: GameState): Promise<Action>;
  abstract getGlyph(): Glyph;

  checkVisible(sightMap: SightMap) {
    this.visible = sightMap.isVisible(
      this.position.x,
      this.position.y,
    );
  }

  refreshVisuals(): Drawable | null {
    if (this.visible) {
      return this.getGlyph();
    }
    return null;
  }

  canMove(position: { x: number; y: number; }, map: GameMap): boolean {
    return map.passable(position.x, position.y);
  }
}

export abstract class Character extends GameEntity {
  name: string; 

  maxHealth: number;
  health: number;

  accuracy: number;
  damage: number;
  dodge: number;
  armor: number;

  items: Item[];
  equipment: Map<string, Equippable | null> = new Map(equipSlots);
  buffs: Buff[];
  
  attack(state: GameState): [number, number] {
    let accuracy = this.accuracy;
    let damage = this.damage;

    for (const buff of this.buffs) {
      const [acc, dam] = buff.attack(state, this);
      accuracy += acc;
      damage += damage;
    }

    const weapon = this.equipment.get("weapon");
    if ("attack" in weapon) {
      const [acc, dam] = (weapon as Attackable).attack(state, this);
      accuracy += acc;
      damage += dam;
    }

    return [accuracy, damage];
  }

  defend(state: GameState): [number, number] {
    let dodge = this.dodge;
    let armor = this.armor;

    for (const buff of this.buffs) {
      const [dod, arm] = buff.defend(state, this);
      dodge += dod;
      armor += arm;
    }

    const equippedArmor = this.equipment.get("armor");
    if ("defend" in equippedArmor) {
      const [dod, arm] = (equippedArmor as Defendable).defend(state, this);
      dodge += dod;
      armor += arm;
    }

    return [dodge, armor];
  }

  addBuff(buff: Buff) {
    this.buffs.push(buff);
  }

  applyBuffs(state: GameState) {
    for (let i = 0; i < this.buffs.length; i++) {
      const buff = this.buffs[i];
      buff.update(state, this);
      buff.turnsRemaining -= 1;
      if (buff.turnsRemaining == 0) {
        buff.end(this);
        this.buffs.splice(i, 1);
      }
    }
  }
  
  die(state: GameState): void {}
}

export abstract class UIComponent extends GameObject {
  boundaries: Position
  layer: Layer
  constructor (boundaries: Position) {
    super();
    this.boundaries = boundaries;
    this.layer = new Layer(1000, boundaries);
    this.layer.lazyDraw = false;
  }

  async updateContent(): Promise<void> {
    return;
  }

  refreshVisuals() {
    getRenderer().addLayer(this.layer);
  }
}
