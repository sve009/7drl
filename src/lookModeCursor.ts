import { dirMap } from "./constants";
import { GameEvent } from "./gameEvent";
import { UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import { IOHandler } from "./io";
import { Glyph, Position } from "./renderer";
import * as UIGameEvents from "./uiGameEvent"

export class LookModeCursor extends UIComponent {
    ioHandler: IOHandler = new IOHandler;
    gameState: GameState | null = null;
    lockedRadius: number = 0; 
    startingPosition: { x: number, y: number };

    constructor (layerIdx: number) {
      super(new Position(0, 0, 1, 1), layerIdx, true)
      this.layer.lazyDraw = false;
    }

    updatePosition (pos: { x: number, y: number }): void {
      this.activate();
      this.lockedRadius = 0;
      this.boundaries.startX = pos.x;
      this.boundaries.startY = pos.y;
    }

    lockToPlayer(radius: number) {
      this.lockedRadius = radius;
    }

    currentPosition (): { x: number, y: number } {
      return { x: this.boundaries.startX, y: this.boundaries.startY }
    }

    async updateContent(): Promise<GameEvent> {
      let key = await this.ioHandler.requestKey();
      let dir = -1;
      switch (key) {
        case "h": {
          dir = 0;
          break;
        }
        case "j": {
          dir = 1;
          break;
        }
        case "k": {
          dir = 3;
          break;
        }
        case "l": {
          dir = 2;
          break;
        }
        case "y": {
          dir = 7;
          break;
        }
        case "u": {
          dir = 6;
          break;
        }
        case "b": {
          dir = 4;
          break;
        }
        case "n": {
          dir = 5;
          break;
        }
        case "escape":
          return new UIGameEvents.ExitUI;
      }

      if (dir != -1) {
        const { x, y } = dirMap.get(dir);
        const fx = this.boundaries.startX + x;
        const fy = this.boundaries.startY + y;

        if (!this.lockedRadius && this.gameState.isWithinMapBoundaries(fx, fy)) {
            this.boundaries.startX = fx;
            this.boundaries.startY = fy;
        }
        if (this.lockedRadius && this.distFromStart(fx, fy) <= this.lockedRadius &&
          this.gameState.isWithinMapBoundaries(fx, fy)) {
          this.boundaries.startX = fx;
          this.boundaries.startY = fy;
        }
      }

      return new UIGameEvents.NoEvent;
    }

    distFromStart (x: number, y: number): number {
      return Math.pow(Math.pow(this.startingPosition.x - x, 2) + Math.pow(this.startingPosition.y - y, 2), 0.5);
    }

    refreshVisuals(): void {
        super.refreshVisuals();
        this.layer.addDrawable(new Glyph(0, 0, null, null, "#fff"))
        this.gameState.fullRefresh();
    }
}