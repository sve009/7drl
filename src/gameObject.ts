import { Action } from "./action";
import { SightMap } from "./fov";
import { GameMap, GameState } from "./gamestate";
import type { Item, Equippable } from "./item";
import { Drawable, getRenderer, Layer, Position, Glyph } from "./renderer";

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
  items: Item[];
  equipment: Map<string, Equippable | null> = new Map(equipSlots);
  
  abstract attack(): [number, number];
  abstract defend(): [number, number];
  
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
