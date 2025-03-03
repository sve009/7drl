import { UIManager } from "./ui";

abstract class DrawObject {
    uiManager: UIManager

    constructor(uimanager: UIManager) {
        this.uiManager = uimanager;
    }

    abstract refreshVisuals(): void;
    abstract notifyUI(): void;
}

export abstract class GameEntity extends DrawObject{
    abstract updateState(): void
}

export abstract class UIComponent extends DrawObject {
    abstract updateContent(): void
}
