import { Action } from "./action";
import { SightMap } from "./fov";
import { GameMap, GameState } from "./gamestate";
import { Glyph, Layer } from "./renderer";
import { getUIManager, UIManager } from "./ui";

abstract class GameObject {
    uiManager: UIManager

    constructor() {
        this.uiManager = getUIManager();
    }

    abstract refreshVisuals(sightMap: SightMap): Glyph | null;
    abstract notifyUI(): void;
}

export abstract class GameEntity extends GameObject{
    position: { x: number; y: number; };
    abstract updateState(state: GameState): Promise<Action>;
    canMove(position: { x: number; y: number; }, map: GameMap): boolean {
        return map.passable(position.x, position.y);
    }
    notifyUI(): void {
        
    }
}
export abstract class Character extends GameEntity {
    health: number;
  
    abstract attack(): [number, number];
    abstract defend(): [number, number];
  
    die(state: GameState): void {}
  }   

export abstract class UIComponent extends GameObject {
    layer: Layer
    abstract updateContent(): void
    notifyUI (): void {
        
    }
}
