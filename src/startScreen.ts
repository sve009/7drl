import { GameEvent } from "./gameEvent";
import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import { getGameName } from "./game";
import * as UIGameEvents from "./uiGameEvent";

export class StartScreen extends SelectionPanel {
  text: string;
  buttonNames = [
    "Start",
    "Help",
    "Credits"
  ];
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
      getGameName(),
      "",
      "2000 years after the end of civilization and 2000 years before another age of silicon. The church has been the only institution to survive the apocolypse and retain any memory of the fires and radiation.",
      "",
      "The priest has tasked you to enter the forbidden dungeon in search of artifacts of a forgotten time.",
      "",
      "Are you ready?",
      "",
      "Navigate using <h>, <j>, <k>, <l> keys. Select using <enter>.",
      "Press <?> for help."
    ].join("\n");
  }

  async updateContent(): Promise<GameEvent> {
    const event = await super.updateContent();
    if (event instanceof UIGameEvents.Select) {
      switch (this.selectionIdx) {
        case 0:
          return new UIGameEvents.ExitUI();
        case 1:
          return new UIGameEvents.OpenHelp();
        case 2:
          return new UIGameEvents.ShowCredits();
      }
      return new UIGameEvents.NoEvent();
    }
    return event;
  }

  refreshVisuals(): void {
    // Display text first
    this.layer.addDrawable(new TextDrawable(1, 1, this.text, this.boundaries.getWidth() - 2));

    // Add buttons
    for (let i = 0; i < this.buttonNames.length; i++) {

      // Add button text
      const bText = this.buttonNames[i];
      const x =  27 + i * 9;
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