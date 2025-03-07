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

  constructor ( boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.showBorder = true;
    this.title = "Pause";
  }
  async updateContent(): Promise<GameEvent> {
    const event = await super.updateContent();
    if (event instanceof UIGameEvents.Select) {
      switch (this.selectionIdx) {
        case 0:
          return new UIGameEvents.RestartGame();
        case 1:
          return new UIGameEvents.OpenHelp();
      }
      return new UIGameEvents.NoEvent();
    }
    return event;
  }

    refreshVisuals(): void {
      // Add buttons
      for (let i = 0; i < this.buttonNames.length; i++) {
  
        // Add button text
        const bText = this.buttonNames[i];
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