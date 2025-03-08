import { GameEvent } from "./gameEvent";
import { IOHandler } from "./io";
import { MovementControl } from "./movementControl";
import { Position, TextDrawable } from "./renderer";
import { SelectionPanel } from "./selectionPanel";
import * as UIGameEvents from "./uiGameEvent";

export class HelpPanel extends SelectionPanel {
  ioHandler: IOHandler = new IOHandler;
  helpText: string
  indentHelpText: string

  buttonNames = [
    "hjkl",
    "wasd",
    "arrow"
  ];
  indexMap: number[];

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.showBorder = true;
    this.title = "Help";

    this.helpText = [
      "Pause: <escape>",
      "Inventory: i",
      "",
      "Movement Keys:",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Look Mode: ;",
      "Pick up: ,",
      "Wait a turn: .",
      "",
      "Interact: Move towards NPC or Enemy",
      "Help: ?"
    ].join("\n");
    this.indentHelpText = [
      "",
      "",
      "",
      "",
      MovementControl.convertDirectionToKey("left") + " - left",
      MovementControl.convertDirectionToKey("down") + " - down",
      MovementControl.convertDirectionToKey("up") + " - up",
      MovementControl.convertDirectionToKey("right") + " - right",
      MovementControl.convertDirectionToKey("upleft") + " - up/left diagonal",
      MovementControl.convertDirectionToKey("upright") + " - up/right diagonal",
      MovementControl.convertDirectionToKey("downright") + " - down/right diagonal",
      MovementControl.convertDirectionToKey("downleft") + " - down/left diagonal",
      "> - Go down stairs (Must be on a '>' tile)",
      "< - Go up stairs (Must be on a '<' tile)",
    ].join("\n");

    this.indexMap = [];
    let count = 0;
    for (let i = 0; i < this.buttonNames.length; i++) {
        this.indexMap.push(count);
        count++;
    }
    this.numberOfRows = count - 1;
  }

    async updateContent(): Promise<GameEvent> {
      const event = await super.updateContent();
      if (event instanceof UIGameEvents.Select) {
        switch (this.selectionIdx) {
          case 0:
            MovementControl.setPreference(this.buttonNames[this.selectionIdx]);
            break;
          case 1:
            MovementControl.setPreference(this.buttonNames[this.selectionIdx]);
            break;
          case 2:
            MovementControl.setPreference(this.buttonNames[this.selectionIdx]);
            break;
        }
        this.indentHelpText = [
          "",
          "",
          "",
          "",
          MovementControl.convertDirectionToKey("left") + " - left",
          MovementControl.convertDirectionToKey("down") + " - down",
          MovementControl.convertDirectionToKey("up") + " - up",
          MovementControl.convertDirectionToKey("right") + " - right",
          MovementControl.convertDirectionToKey("upleft") + " - up/left diagonal",
          MovementControl.convertDirectionToKey("upright") + " - up/right diagonal",
          MovementControl.convertDirectionToKey("downright") + " - down/right diagonal",
          MovementControl.convertDirectionToKey("downleft") + " - down/left diagonal",
          "> - Go down stairs (Must be on a '>' tile)",
          "< - Go up stairs (Must be on a '<' tile)",
        ].join("\n");
    
        return new UIGameEvents.NoEvent();
      }

      return event;
    }

  refreshVisuals(): void {
    this.layer.addDrawable(new TextDrawable(1, 1, this.helpText, this.boundaries.getWidth() - 2))
    this.layer.addDrawable(new TextDrawable(4, 1, this.indentHelpText, this.boundaries.getWidth() - 5))

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