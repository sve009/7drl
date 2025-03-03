import { Action } from "./action";
import { SightMap } from "./fov";
import { GameMap, GameState } from "./gamestate";
import { Drawable, getRenderer, Layer, Position } from "./renderer";

abstract class GameObject {}

export abstract class GameEntity extends GameObject{
    position: { x: number; y: number; };
    dungeonLevel: number;

    abstract updateState(state: GameState): Promise<Action>;
    abstract refreshVisuals(): Drawable | null;

    canMove(position: { x: number; y: number; }, map: GameMap): boolean {
      return map.passable(position.x, position.y);
    }
}

export abstract class Character extends GameEntity {
    health: number;
  
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
        getRenderer().addPermanentLayer(this.layer);
    }
    abstract updateContent(): void
    abstract refreshVisuals(): void;
}
