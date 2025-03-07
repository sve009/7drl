import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import type { Item } from "./item";
import { Inventory } from "./inventory";
import type { GameEvent } from "./gameEvent";
import { Select, NoEvent } from "./uiGameEvent";
import { getUIManager } from "./uiManager";

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
    const event = await super.updateContent();
    if (event instanceof Select) {
      const uiItem = this.orderedStuff[this.selectionIdx];
      if (typeof(uiItem) == "string") {
        for (let i = 0; i < this.items.propsMap.length; i++) {
          if (this.items.propsMap[i] == uiItem) {
            this.items.expanded[i] = !this.items.expanded[i];
            break;
          }
        }
      } else {
        const item = uiItem as Item;
        const buttons: [
          boolean,
          boolean,
          boolean,
          boolean,
          boolean,
        ] = [
          true,
          true,
          "apply" in item,
          "throw" in item,
          "equip" in item,
        ];
        getUIManager().createDialogPanel(
          item, 
          null, 
          buttons
        );
      }
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
      let y = 1;
      for (let i = 0; i < m.length; i++) {
        const exp = this.invertIfSelected(
          this.items.expanded[i] ? "-" : "+",
          y
        );
        let str = "[";
        str += exp;
        str += "] ";
        str += m[i];

        this.layer.addDrawable(new TextDrawable(1, y, str));

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

          this.layer.addDrawable(new TextDrawable(2, y, itemStr));

          this.orderedStuff.push(this.items[m[i]][j]);
          y += 1;
        }
      }
    }
    super.refreshVisuals()
  }

  invertIfSelected(str: string, y: number): string {
    if (y - 1 == this.selectionIdx) {
      str = `%c{#000}%b{#fff}${str}%c{}%b{}`; 
    }
    return str;
  }
}
