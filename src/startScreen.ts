import { GameEvent } from "./gameEvent";
import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import { getGameName } from "./game";

export class StartScreen extends SelectionPanel {
  text: string = getGameName();
  buttonNames = [
    "Start",
    "Help"
  ];
  indexMap: number[];

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.layer.index = layerIdx;
    this.showBorder = true;

    this.indexMap = [];
    let count = 0;
    for (let i = 0; i < this.buttonNames.length; i++) {
        this.indexMap.push(count);
        count++;
    }
    this.numberOfRows = count - 1;
  }

  updateContent(): Promise<GameEvent> {
    const event = super.updateContent();
    return event;
  }

  refreshVisuals(): void {
    // Display text first
    this.layer.addDrawable(new TextDrawable(1, 1, this.text));

    // Add buttons
    for (let i = 0; i < this.buttonNames.length; i++) {

      // Add button text
      const bText = this.buttonNames[i];
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