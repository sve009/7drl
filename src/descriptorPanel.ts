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
    this.layer.bg = "#000";
    this.lookModeCursor = lookModeCursor;
  }

  refreshVisuals() {
    super.refreshVisuals();
  }
}
