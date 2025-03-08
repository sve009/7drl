import { GameEvent } from "./gameEvent";
import { UIComponent } from "./gameObject";
import { IOHandler } from "./io";
import { Position, TextDrawable } from "./renderer";
import * as UIGameEvents from "./uiGameEvent";

export class HelpPanel extends UIComponent {
  ioHandler: IOHandler = new IOHandler;
  helpText: string
  indentHelpText: string
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
      "h - left",
      "j - down",
      "k - up",
      "l - right",
      "y - up/left diagonal",
      "u - up/right diagonal",
      "n - down/right diagonal",
      "b - down/left diagonal",
      "> - Go down stairs (Must be on a '>' tile)",
      "< - Go up stairs (Must be on a '<' tile)",
    ].join("\n");
  }

    async updateContent(): Promise<GameEvent> {
      let key = await this.ioHandler.requestKey();
      switch (key) {
        case "escape":
          return new UIGameEvents.ExitUI;
      }
      return new UIGameEvents.NoEvent;
    }

  refreshVisuals(): void {
    this.layer.addDrawable(new TextDrawable(1, 1, this.helpText, this.boundaries.getWidth() - 2))
    this.layer.addDrawable(new TextDrawable(4, 1, this.indentHelpText, this.boundaries.getWidth() - 5))
    super.refreshVisuals();
  }
}