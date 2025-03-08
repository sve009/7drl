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
      case "left":
        this.selectionIdx -= 1;
        break;
      case "down":
        this.selectionIdx += 1;
        break;
      case "up":
        this.selectionIdx -= 1;
        break;
      case "right":
        this.selectionIdx += 1;
        break;
      case "enter":
        return new UIGameEvents.Select;
      case "escape":
        return new UIGameEvents.ExitUI;
    }
    this.selectionIdx = Math.min(
      Math.max(0, this.selectionIdx), 
      this.numberOfRows
    );

    return new UIGameEvents.NoEvent;
  }
}
