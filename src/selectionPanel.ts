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
    let idx = this.selectionIdx;
    switch (key) {
      case "j":
        idx += 1;
        break;
      case "k":
        idx -= 1;
        break;
      case "enter":
        return new UIGameEvents.Select;
      case "escape":
        return new UIGameEvents.ExitUI;
      default:
        return;
    }
    idx = Math.min(Math.max(0, idx), this.numberOfRows - 1)

    return new UIGameEvents.NoEvent;
  }
}
