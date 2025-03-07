import { UIComponent } from "./gameObject";
import { Position, TextDrawable } from "./renderer";

export class LogPanel extends UIComponent {
  logs: Array<string> = []

  constructor (layerIdx: number) {
    super();
    this.layer.index = layerIdx;

    this.title = "Log";
    this.showBorder = true;
  }

  refreshVisuals() {
    super.refreshVisuals();
    const maxShown = this.boundaries.getHeight() - 2;
    const numLogs = Math.min(this.logs.length, maxShown);
    let logString = this.logs.slice(this.logs.length - numLogs, this.logs.length).join("\n");

    this.layer.addDrawable(new TextDrawable(3, 1, logString, this.boundaries.getWidth() - 4));
  }

  addLogMessage(text: string) {
    this.logs.push(text);
  }
}
