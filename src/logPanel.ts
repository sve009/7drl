import { SightMap } from "./fov";
import { UIComponent } from "./gameObject";
import { Position, TextDrawable } from "./renderer";

export class LogPanel extends UIComponent {
    logs: Array<string> = []

    updateContent(): void {

    }

    refreshVisuals() {
        const numLogs = Math.max(Math.min(this.boundaries.getHeight() - 1, this.logs.length - 1), 0);
        const logString = "Logs:\n" + this.logs.splice(0, numLogs).join("\n");

        this.layer.addDrawable(new TextDrawable(this.boundaries.getStartX(), this.boundaries.getStartY(), logString));

        return new TextDrawable(this.boundaries.getStartX(), this.boundaries.getStartY(), logString);
    }

    addLogMessage (text: string) {
        this.logs.push(text);
    }
}