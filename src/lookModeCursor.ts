import { dirMap } from "./constants";
import { GameEvent } from "./gameEvent";
import { UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import { IOHandler } from "./io";
import { Glyph, Position } from "./renderer";
import * as UIGameEvents from "./uiGameEvent"

export class LookModeCursor extends UIComponent {
    ioHandler: IOHandler = new IOHandler;
    gameState: GameState | null = null

    constructor (layerIdx: number) {
      super(new Position(0, 0, 1, 1), layerIdx, true)
      this.layer.lazyDraw = false;
    }

    updatePosition (pos: { x: number, y: number }): void {
      this.activate();
      this.boundaries.startX = pos.x;
      this.boundaries.startY = pos.y;
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

        if (this.gameState.isWithinMapBoundaries(fx, fy)) {
          this.boundaries.startX = fx;
          this.boundaries.startY = fy;
        }
      }

      return new UIGameEvents.NoEvent;
    }

    refreshVisuals(): void {
        super.refreshVisuals();
        const position = this.currentPosition();
        this.layer.addDrawable(new Glyph(position.x, position.y, null, null, "#fff"))
        this.gameState.fullRefresh();
    }
}