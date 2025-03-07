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

  constructor (layerIdx: number) {
    super();
    this.layer.index = layerIdx;
    this.title = "Inventory";
    this.showBorder = true;
  }

  async updateContent(): Promise<GameEvent> {
    this.numberOfRows = this.orderedStuff.length - 1;
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
          "equippedTo" in item && item.equippedTo == null,
          "apply" in item,
          "throw" in item,
          "equip" in item,
        ];
        const callbacks = {
          drop: (inst: Item) => {
            this.items.removeItem(inst);
          },
          apply: (inst: Item) => {
            this.items.removeItem(inst);
          },
          throw: (inst: Item) => {
            this.items.removeItem(inst);
          },
          equip: (inst: Item) => {}
        };
        getUIManager().createDialogPanel(
          item, 
          null, 
          buttons,
          callbacks
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

        this.layer.addDrawable(
          new TextDrawable(
            1, 
            y, 
            str, 
            this.boundaries.getWidth() - 2
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
          let itemStr = this.items[m[i]][j].name; 
          if ("equippedTo" in (this.items[m[i]][j])) {
            if (this.items[m[i]][j].equippedTo) {
              itemStr += " [Equipped]";
            }
          }
          itemStr = this.invertIfSelected(
            itemStr,
            y
          );
          itemStr = menuChar + itemStr;

          this.layer.addDrawable(
            new TextDrawable(
              2, 
              y, 
              itemStr, 
              this.boundaries.getWidth() - 3
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
    if (y - 1 == this.selectionIdx) {
      str = `%c{#000}%b{#fff}${str}%c{}%b{}`; 
    }
    return str;
  }
}
