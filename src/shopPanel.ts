import { SelectionPanel } from "./selectionPanel";
import { Position, TextDrawable } from "./renderer";
import { GameEvent } from "./gameEvent";
import { Select, NoEvent } from "./uiGameEvent";
import { Player } from "./player";
import { Item } from "./item";

export class ShopMenu extends SelectionPanel {
  player: Player;
  inventory: Item[];

  constructor(inventory: Item[], player: Player) {
    super();

    this.setBoundaries(new Position(20, 10, 40, 20));

    this.inventory = inventory;
    this.player = player;
    this.numberOfRows = inventory.length;

    this.showBorder = true;
    this.title = "Shop";
  }

  async updateContent(): Promise<GameEvent> {
    this.numberOfRows = this.inventory.length - 1;

    const event = await super.updateContent();
    if (event instanceof Select) {
      const idx = this.selectionIdx;
      const item = this.inventory[idx];
      if (item.cost <= this.player.gold) {
        const i = this.inventory.findIndex((other) => other == item);
        this.inventory.splice(i, 1);

        this.player.gold -= item.cost;
        this.player.items.addItem(item);
      }

      return new NoEvent();
    }

    return event;
  }

  refreshVisuals() {
    // Gold
    this.layer.addDrawable(
      new TextDrawable(
        1,
        1,
        `Gold: ${this.player.gold}`,
      )
    );

    // Items
    for (let i = 0; i < this.inventory.length; i++) {
      const item = this.inventory[i];
      this.layer.addDrawable(
        new TextDrawable(
          3,
          2 + i,
          this.invertIfSelected(
            `${item.name}: ${item.cost} gold`,
            i
          ),
        )
      );
    }
    super.refreshVisuals();
  }

  invertIfSelected(str: string, y: number): string {
    if (y == this.selectionIdx) {
      str = `%c{#000}%b{#fff}${str}%c{}%b{}`; 
    }
    return str;
  }
}
