import { UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";
import { Position } from "./renderer";

export class DescriptorPanel extends UIComponent {
  lookModeCursor: LookModeCursor
  gameState: GameState

  constructor(boundaries: Position, layerIdx: number, lookModeCursor: LookModeCursor) {
    super(boundaries, layerIdx);
    this.title = "Description";
    this.showBorder = true;
    this.lookModeCursor = lookModeCursor;
  }

  refreshVisuals(): void {
    let description: string = "";
    if (this.lookModeCursor.active) {
      const cursorLocation: Position = this.lookModeCursor.boundaries;
      this.gameState.currentMap.getDescription(cursorLocation.startX, cursorLocation.startY);
    } else {
      this.gameState.currentMap.getDescription(this.gameState.player.position.x, this.gameState.player.position.y);
    }
    super.refreshVisuals();
  }
}