import { UIComponent } from "./gameObject";
import { Position, TextDrawable } from "./renderer";

export class LogPanel extends UIComponent {
  logs: Array<string> = []

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.layer.bg = "#000";

    this.title = "Log";
    this.showBorder = true;
  }

  refreshVisuals() {
    super.refreshVisuals();
    const maxShown = this.boundaries.getHeight() - 1;
    const numLogs = Math.min(this.logs.length, maxShown);
    let logString = this.logs.slice(this.logs.length - numLogs, this.logs.length).join("\n");

    this.layer.addDrawable(
      new TextDrawable(
      this.boundaries.getStartX() + 3, 
      this.boundaries.getStartY() + 1, 
      logString
      )
    );
  }

  addLogMessage(text: string) {
    this.logs.push(text);
  }
}
