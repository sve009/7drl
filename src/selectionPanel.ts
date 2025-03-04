import { UIComponent } from "./gameObject";
import { IOHandler } from "./io";
import { getUIManager } from "./uiManager";

export abstract class SelectionPanel extends UIComponent {
  ioHandler: IOHandler = new IOHandler;
  selectionIdx: number
  numberOfRows: number

  async updateContent() {
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
        return;
      case "escape":
        getUIManager().exitCurrentFocus();
      default:
        return;
    }
    idx = Math.min(Math.max(0, idx), this.numberOfRows - 1)
  }
}