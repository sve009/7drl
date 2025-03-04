import { UIComponent } from "./gameObject";
import { Position, TextDrawable } from "./renderer";

export class LogPanel extends UIComponent {
    logs: Array<string> = []

    refreshVisuals() {
        super.refreshVisuals();
        const numLogs = Math.max(Math.min(this.boundaries.getHeight() - 1, this.logs.length - 1), 0);
        let logString = "Log:\n" + this.logs.splice(0, numLogs).join("\n");
        logString = ` %b{${this.layer.bg}}${logString}`;

        this.layer.addDrawable(new TextDrawable(this.boundaries.getStartX(), this.boundaries.getStartY(), logString));
    }

    addLogMessage (text: string) {
        this.logs.push(text);
    }

    constructor (boundary: Position) {
        super(boundary);
        this.layer.bg = "#2b3647";
    }
}