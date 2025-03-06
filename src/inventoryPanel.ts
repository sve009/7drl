import { Position } from "./renderer";
import { SelectionPanel } from "./selectionPanel";

export class InventoryPanel extends SelectionPanel {
  refreshVisuals() {
    super.refreshVisuals()
  }

  constructor (boundary: Position) {
    super(boundary);
    this.layer.bg = "#000";
    this.title = "Inventory";
    this.showBorder = true;
  }
}
