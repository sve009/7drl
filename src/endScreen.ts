import { GameEvent } from "./gameEvent";
import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import * as UIGameEvents from "./uiGameEvent"

export class EndScreen extends SelectionPanel {
  text: string;
  buttonNames = ["Restart"];
  indexMap: number[];

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.showBorder = true;

    this.indexMap = [];
    let count = 0;
    for (let i = 0; i < this.buttonNames.length; i++) {
        this.indexMap.push(count);
        count++;
    }
    this.numberOfRows = count - 1;
    this.text = [
      "Game Over",
      "",
      "The forbidden dungeons have captured another orphan. Perhaps another may be able to recover all the artifacts."
    ].join("\n");
  }

  async updateContent(): Promise<GameEvent> {
    const event = await super.updateContent();
    if (event instanceof UIGameEvents.Select) {
      return new UIGameEvents.RestartGame();
    }
    return new UIGameEvents.NoEvent();
  }

  refreshVisuals(): void {
    // Display text first
    this.layer.addDrawable(new TextDrawable(1, 1, this.text, this.boundaries.getWidth() - 2));

    // Add buttons
    for (let i = 0; i < this.buttonNames.length; i++) {

      // Add button text
      const bText = this.buttonNames[i];
      const x = 14 + i * 9;
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