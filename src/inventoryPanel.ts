import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import { Item } from "./item";

export class InventoryPanel extends SelectionPanel {
  items?: Item[];

  constructor (boundary: Position) {
    super(boundary);
    this.layer.bg = "#000";
    this.title = "Inventory";
    this.showBorder = true;
  }

  refreshVisuals() {
    if (this.items) {
      for (let i = 0; i < this.items.length; i++) {
        this.layer.addDrawable(
          new TextDrawable(
            this.boundaries.getStartX() + 1,
            this.boundaries.getStartY() + 1 + i,
            this.items[i].name
          )
        );
      }
    }
    super.refreshVisuals()
  }
}
