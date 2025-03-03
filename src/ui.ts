import { UIComponent } from "./gameObject";
import { Layer } from "./renderer";

export class UIManager {
    uiObjects: Array<UIComponent>

    constructor() {
        this.uiObjects = new Array;
    }

    async updateContent() {
        for (const uiObj of this.uiObjects) {
            uiObj.updateContent();
        }
    }

    refreshVisual() {
        for (const uiObj of this.uiObjects) {
            uiObj.refreshVisuals();
        }
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
