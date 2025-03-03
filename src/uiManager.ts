import { LogPanel } from "./logPanel";
import { Layer, Position } from "./renderer";
import { UIComponent } from "./gameObject";
import { PlayerPanel } from "./playerPanel";

export class UIManager {
    uiObjects: Array<UIComponent>
    logPanel: LogPanel
    playerPanel: PlayerPanel

    constructor() {
        this.uiObjects = new Array;
        this.logPanel = new LogPanel(new Position(0, 40, 80, 4));
        this.playerPanel = new PlayerPanel(new Position(80, 10, 40, 10));
    }

    async updateContent() {
        for (const uiObj of this.uiObjects) {
            uiObj.updateContent();
        }
        this.logPanel.updateContent();
    }

    refreshVisual() {
        for (const uiObj of this.uiObjects) {
            uiObj.refreshVisuals();
        }
        this.logPanel.refreshVisuals();
        this.playerPanel.refreshVisuals();
    }

    getUILayers (): Array<Layer> {
        const layers = new Array<Layer>;
        for (const uiObj of this.uiObjects) {
            layers.push(uiObj.layer);
        }
        return layers;
    }
}


let uiManager = new UIManager;
export function getUIManager() {
    return uiManager;
}

export function logMessage(text: string) {
    uiManager.logPanel.addLogMessage(text);
}
