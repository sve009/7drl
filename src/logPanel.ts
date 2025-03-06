import { UIComponent } from "./gameObject";
import { Position, TextDrawable } from "./renderer";

export class LogPanel extends UIComponent {
  logs: Array<string> = []

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.layer.bg = "#2b3647";
  }

  refreshVisuals() {
    super.refreshVisuals();
    const maxShown = this.boundaries.getHeight() - 1;
    const numLogs = Math.min(this.logs.length, maxShown);
    let logString = this.logs.slice(this.logs.length - numLogs, this.logs.length).join("\n");
    logString = ` %b{${this.layer.bg}}${logString}`;

    this.layer.addDrawable(
      new TextDrawable(
      this.boundaries.getStartX() + 1, 
      this.boundaries.getStartY(), 
      `%b{${this.layer.bg}}LOG`
      )
    );
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
