import { GameEvent } from "./gameEvent";
import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import * as UIGameEvents from "./uiGameEvent";

export class PausePanel extends SelectionPanel {
  buttonNames = [
    "Restart",
    "Help"
  ];
  altButtonNames = [
    "Yes",
    "No"
  ];
  indexMap: number[];
  confirmedRestart: boolean = false

  constructor ( boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.showBorder = true;
    this.title = "Pause";

    this.indexMap = [];
    let count = 0;
    for (let i = 0; i < this.buttonNames.length; i++) {
        this.indexMap.push(count);
        count++;
    }
    this.numberOfRows = count - 1;
  }

  firstButton (): GameEvent {
    if (this.confirmedRestart) {
      this.confirmedRestart = false;
      return new UIGameEvents.RestartGame();
    } 
    this.confirmedRestart = true;
    return new UIGameEvents.NoEvent;
  }

  secondButton () {
    if (!this.confirmedRestart) {
      return new UIGameEvents.OpenHelp();
    }
    this.confirmedRestart = false;
    return new UIGameEvents.NoEvent;
  }

  async updateContent(): Promise<GameEvent> {
    const event = await super.updateContent();
    if (event instanceof UIGameEvents.Select) {
      switch (this.selectionIdx) {
        case 0:
          return this.firstButton();
        case 1:
          return this.secondButton();
      }
      return new UIGameEvents.NoEvent();
    }
    return event;
  }

    refreshVisuals(): void {
      let buttons = this.buttonNames;
      if (this.confirmedRestart) {
        buttons = this.altButtonNames;
        this.layer.addDrawable(new TextDrawable(6,2, "Are you sure?"));
      }
      // Add buttons
      for (let i = 0; i < buttons.length; i++) {
  
        // Add button text
        const bText = buttons[i];
        const x = this.boundaries.getWidth() / 2 - 10 + 2 + i * 9;
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