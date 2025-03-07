import { UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";
import { Position, TextDrawable } from "./renderer";

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
      const pos = this.lookModeCursor.currentPosition();
      description = this.gameState.currentMap.getDescription(pos.x, pos.y);
    } else {
      description = this.gameState.currentMap.getDescription(this.gameState.player.position.x, this.gameState.player.position.y);
    }
    this.layer.addDrawable(new TextDrawable(this.boundaries.startX + 1, this.boundaries.startY + 1, description));
    super.refreshVisuals();
  }
}
