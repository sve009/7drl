import { UIComponent } from "./gameObject";
import { IOHandler } from "./io";
import * as UIGameEvents from "./uiGameEvent";
import { GameEvent } from "./gameEvent";

export abstract class SelectionPanel extends UIComponent {
  ioHandler: IOHandler = new IOHandler;
  selectionIdx: number = 0;
  numberOfRows: number;

  async updateContent(): Promise<GameEvent> {
    let key = await this.ioHandler.requestKey();
    switch (key) {
      case "h":
        this.selectionIdx -= 1;
        break;
      case "j":
        this.selectionIdx += 1;
        break;
      case "k":
        this.selectionIdx -= 1;
        break;
      case "l":
        this.selectionIdx += 1;
        break;
      case "enter":
        return new UIGameEvents.Select;
      case "escape":
        return new UIGameEvents.ExitUI;
    }
    this.selectionIdx = Math.min(
      Math.max(0, this.selectionIdx), 
      this.numberOfRows - 2
    );

    return new UIGameEvents.NoEvent;
  }
}
