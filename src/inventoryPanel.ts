import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import type { Item } from "./item";
import { Inventory } from "./inventory";
import type { GameEvent } from "./gameEvent";
import { Select, NoEvent } from "./uiGameEvent";

type OrderedElement = string | Item;

export class InventoryPanel extends SelectionPanel {
  items?: Inventory;
  orderedStuff: OrderedElement[];

  constructor (boundary: Position, layerIdx: number) {
    super(boundary, layerIdx);
    this.layer.bg = "#000";
    this.title = "Inventory";
    this.showBorder = true;

    this.numberOfRows = this.boundaries.height - 2;
  }

  async updateContent(): Promise<GameEvent> {
    let event = await super.updateContent();

    if (event instanceof Select) {
      console.log('select');
      return new NoEvent();
    } else {
      return event;
    }
  }

  // Oooooh this is a doozy I hate nesting
  refreshVisuals() {
    this.orderedStuff = [];
    const m = this.items.propsMap;
    if (this.items) {
      let y = this.boundaries.getStartY() + 1;
      for (let i = 0; i < m.length; i++) {
        const exp = this.invertIfSelected(
          this.items.expanded[i] ? "-" : "+",
          y
        );
        let str = "[";
        str += exp;
        str += "] ";
        str += m[i];

        this.layer.addDrawable(
          new TextDrawable(
            this.boundaries.getStartX() + 1,
            y,
            str
          )
        );

        this.orderedStuff.push(m[i]);
        y += 1;

        if (!this.items.expanded[i]) {
          continue;
        }

        for (let j = 0; j < this.items[m[i]].length; j++) {
          const menuChar = (j == this.items[m[i]].length - 1)
            ? "\u{2514} "
            : "\u{251C} ";
          let itemStr = this.invertIfSelected(
            this.items[m[i]][j].name,
            y
          );
          itemStr = menuChar + itemStr;

          this.layer.addDrawable(
            new TextDrawable(
              this.boundaries.getStartX() + 2,
              y,
              menuChar + this.items[m[i]][j].name 
            )
          );

          this.orderedStuff.push(this.items[m[i]][j]);
          y += 1;
        }
      }
    }
    super.refreshVisuals()
  }

  invertIfSelected(str: string, y: number): string {
    const idx = y - this.boundaries.getStartY() - 1;
    if (idx == this.selectionIdx) {
      str = `%c{#000}%b{#fff}${str}%c{}%b{}`; 
    }
    return str;
  }
}
