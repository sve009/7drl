import { Layer } from "./renderer";

export abstract class UI {
    layer: Layer
    constructor (layerIdx: number) {
        this.layer = new Layer(layerIdx);
    }

    async update() {}

    refreshVisual() {}
}

export class UIManager {
    uiObjects: Array<UI>

    constructor() {
        this.uiObjects = new Array;
    }

    async update() {
        for (const uiObj of this.uiObjects) {
            uiObj.update();
        }
    }

    refreshVisual() {
        for (const uiObj of this.uiObjects) {
            uiObj.refreshVisual();
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