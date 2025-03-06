import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import { Inventory } from "./inventory";

export class InventoryPanel extends SelectionPanel {
  items?: Inventory;

  constructor (boundary: Position, layerIdx: number) {
    super(boundary, layerIdx);
    this.layer.bg = "#000";
    this.title = "Inventory";
    this.showBorder = true;
  }

  // Oooooh this is a doozy I hate nesting
  refreshVisuals() {
    const m = this.items.propsMap;
    if (this.items) {
      let y = this.boundaries.getStartY() + 1;
      for (let i = 0; i < m.length; i++) {
        let str = "[";
        str = this.items.expanded[i] ? str + "-" : str + "+";
        str += "] ";
        str += m[i];

        console.log(str);
        console.log('exterior', y);
        this.layer.addDrawable(
          new TextDrawable(
            this.boundaries.getStartX() + 1,
            y,
            str
          )
        );
        y += 1;

        if (!this.items.expanded[i]) {
          continue;
        }

        for (let j = 0; j < this.items[m[i]].length; j++) {
          const menuChar = (j == this.items[m[i]].length - 1)
            ? "\u{2514} "
            : "\u{251C} ";
          console.log(menuChar + this.items[m[i]][j].name);
          console.log('interior', y);
          this.layer.addDrawable(
            new TextDrawable(
              this.boundaries.getStartX() + 2,
              y,
              menuChar + this.items[m[i]][j].name 
            )
          );
          y += 1;
        }
      }
    }
    super.refreshVisuals()
  }
}
