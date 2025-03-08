import { UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import type { Item, Applyable, Equippable, Throwable } from "./item";
import { Position, TextDrawable } from "./renderer";
import { Select, NoEvent, ExitUI, StartThrowCursorMode } from "./uiGameEvent";
import { ApplyAction, EquipAction, DropAction, ThrowAction } from "./action";
import { SelectionPanel } from "./selectionPanel";
import { GameEvent } from "./gameEvent";
import { getUIManager } from "./uiManager";

export type DialogCallbacks = {
  drop: (item: Item) => void;
  apply: (item: Item) => void;
  throw: (item: Item) => void;
  equip: (item: Item) => void;
};

export class DialogPanel extends SelectionPanel {
  text: string;
  buttons: [boolean, boolean, boolean, boolean, boolean];
  item: Item;
  buttonNames = [
    "Ok",
    "Drop",
    "Apply",
    "Throw",
    "Equip",
  ];
  callbacks: DialogCallbacks;

  indexMap: number[];

  throwing: boolean = false;

  constructor(
    boundaries: Position, 
    layerIdx: number, 
    title: string = "Info",
    text: string,
    buttons: [
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
    ],
    item: Item,
    callbacks: DialogCallbacks,
  ) {
    super(boundaries, layerIdx);
    this.title = title;
    this.showBorder = true;

    this.text = text;
    this.buttons = buttons; 
    this.item = item;
    this.callbacks = callbacks;

    this.indexMap = [];
    let count = 0;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i]) {
        this.indexMap.push(count);
        count++;
      } else {
        this.indexMap.push(0);
      }
    }
    this.numberOfRows = count - 1;
  }

  async updateContent(): Promise<GameEvent> {
    // Handle if the user chose to throw last update
    const state = getUIManager().gameState;
    if (this.throwing && state.positionToRemember) {
      this.throwing = false;
      this.callbacks.throw(this.item);
      getUIManager().exitAllFocus();
      return new ThrowAction(
        this.item as unknown as Throwable, 
        state.positionToRemember
      );
    }

    const event = await super.updateContent();
    if (event instanceof Select) {
      let j;
      for (let i = 0; i < this.indexMap.length; i++) {
        if (this.indexMap[i] == this.selectionIdx) {
          j = i;
          break;
        }
      }
      switch (j) {
        case 0:
          // Ok
          return new ExitUI();
        case 1:
          // Drop
          getUIManager().exitCurrentFocus();
          this.callbacks.drop(this.item);
          return new DropAction(this.item);
        case 2:
          // Apply
          getUIManager().exitCurrentFocus();
          this.callbacks.apply(this.item);
          return new ApplyAction(this.item as unknown as Applyable);
        case 3:
          // Throw
          this.throwing = true;
          return new StartThrowCursorMode(15);
        case 4:
          // Equip / Unequip
          getUIManager().exitCurrentFocus();
          this.callbacks.equip(this.item);
          return new EquipAction(this.item as unknown as Equippable);
        default:
          return new NoEvent();
      }
    }
    return event;
  }

  refreshVisuals() {
    // Display text first
    this.layer.addDrawable(new TextDrawable(1, 1, this.text));

    // Add buttons
    for (let i = 0; i < this.buttons.length; i++) {
      if (!this.buttons[i]) {
        continue;
      }

      // Add button text
      let bText = this.buttonNames[i];
      if (bText == "Equip") {
        bText = (this.item as unknown as Equippable).equippedTo
        ? "Unequip"
        : "Equip";
      }

      const x = 2 + i * 9;
      const y = this.boundaries.getHeight() - 3;
      this.layer.addDrawable(
        new TextDrawable(x, y, bText)
      );

      // Draw selection box
      if (this.selectionIdx == this.indexMap[i]) {
        // Top line
        const topLine = "\u{250C}" 
          + "\u{2500}".repeat(7)
          + "\u{2510}";
        this.layer.addDrawable(
          new TextDrawable(
            x - 1,
            y - 1,
            topLine
          )
        );

        // End line
        const botLine = "\u{2514}" 
          + "\u{2500}".repeat(7)
          + "\u{2518}";
        this.layer.addDrawable(
          new TextDrawable(
            x - 1,
            y + 1,
            botLine
          )
        );

        // Middle lines
        this.layer.addDrawable(
          new TextDrawable(
            x - 1,
            y,
            "\u{2502}"
          )
        );
        this.layer.addDrawable(
          new TextDrawable(
            x + 7,
            y,
            "\u{2502}"
          )
        );
      }
    }

    super.refreshVisuals();
  }
}
