import { GameEvent } from "./gameEvent";
import { SightMap } from "./fov";
import { GameMap, GameState } from "./gamestate";
import { Equippable, Attackable, Defendable } from "./item";
import { Drawable, getRenderer, Layer, Position, TextDrawable, Glyph } from "./renderer";
import { Buff } from "./buff";
import { Inventory } from "./inventory";
import { logMessage } from "./uiManager";

abstract class GameObject {}

type EquipSlot = [string, Equippable | null];

const equipSlots: EquipSlot[] = [
  ["weapon", null],
  ["armor", null],
  ["ring", null],
];

export abstract class GameEntity extends GameObject{
  name: string
  position: { x: number; y: number; };
  dungeonLevel: number;

  visible: boolean;
  visibleOverride: boolean = false;
  invisible: boolean = false;

  abstract updateState(state: GameState): Promise<GameEvent>;
  abstract getGlyph(): Glyph;

  checkVisible(sightMap: SightMap) {
    this.visible = sightMap.isVisible(
      this.position.x,
      this.position.y,
    );
  }

  refreshVisuals(): Drawable | null {
    if (this.visible || this.visibleOverride) {
      return this.getGlyph();
    }
    return null;
  }

  canMove(
    position: { x: number; y: number; }, 
    map: GameMap, 
    opensDoors: boolean = true
  ): boolean {
    const idx = position.x + position.y*map.width;
    const isDoor = map.tiles[idx].getSymbol() == "+";
    const canOpen = !isDoor || opensDoors;
    return map.passable(position.x, position.y) && canOpen;
  }
}

export abstract class Character extends GameEntity {
  maxHealth: number;
  health: number;

  accuracy: number;
  damage: number;
  dodge: number;
  armor: number;

  items: Inventory;
  equipment: Map<string, Equippable | null> = new Map(equipSlots);
  buffs: Buff[] = [];
  
  attack(state: GameState): [number, number] {
    let accuracy = this.accuracy;
    let damage = this.damage;

    for (const buff of this.buffs) {
      const [acc, dam] = buff.attack(state, this);
      accuracy += acc;
      damage += dam;
    }

    const weapon = this.equipment.get("weapon");
    if (weapon && "attack" in weapon) {
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
    if (equippedArmor && "defend" in equippedArmor) {
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

  applyDamage(state: GameState, dmg: number) {
    this.health -= dmg;
    if (this.health <= 0) {
      this.die(state);
    }
  }
  
  die(state: GameState): void {
    if (this.visible) {
      logMessage(`${this.name} dies`);
    }
    for (let i = 0; i < state.entities.length; i++) {
      if (state.entities[i] == this) {
        state.entities.splice(i, 1);
      }
    }
  }
}

export abstract class UIComponent extends GameObject {
  boundaries: Position;
  layer: Layer;
  isTransparent: boolean;
  title: string | null;
  showBorder: boolean;
  active: boolean;

  constructor (boundaries: Position = new Position(0, 0, 0, 0), layerIdx: number = 0, isTransparent: boolean = false) {
    super();
    this.boundaries = boundaries;
    this.layer = new Layer(layerIdx, boundaries);
    this.layer.lazyDraw = false;
    this.isTransparent = isTransparent;
    this.showBorder = false;
    this.layer.bg = "#000";
    this.active = false;
  }

  setBoundaries(boundaries: Position) {
    this.boundaries = boundaries;
    this.layer.position = boundaries;
    this.layer.reset();
  }

  async updateContent(): Promise<GameEvent> {
    return;
  }

  activate () {
    this.active = true;
  }

  deactivate () {
    this.active = false;
  }

  drawBorder(): void {
    const titleLength = this.title ? this.title.length : 0;
    const bottomLineLength = this.boundaries.width - 2;
    const topLineLength = bottomLineLength - titleLength - 1;

    // Start line
    this.layer.addDrawable(
      new TextDrawable(0, 0,
        `\u{250C}\u{2500}${this.title ? this.title : ""}` 
        + "\u{2500}".repeat(topLineLength)
        + "\u{2510}"
      )
    );

    // End line
    this.layer.addDrawable(
      new TextDrawable(
        0,
        this.boundaries.getHeight() - 1,
        "\u{2514}" 
        + "\u{2500}".repeat(bottomLineLength)
        + "\u{2518}"
      )
    );

    // Middle lines
    for (let i = 1; i < this.boundaries.height - 1; i++) {
      this.layer.addDrawable(
        new TextDrawable(
          0,
          i,
          "\u{2502}"
        )
      );
      this.layer.addDrawable(
        new TextDrawable(
          this.boundaries.getWidth() - 1,
          i,
          "\u{2502}"
        )
      );
    }
  }

  refreshVisuals() {
    if (this.showBorder) {
      this.drawBorder();
    }
    getRenderer().addLayer(this.layer);
  }
}
