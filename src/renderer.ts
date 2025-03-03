import { Display } from "rot-js";

class Position {
    startX: number
    startY: number
    width: number
    height: number

    constructor (x: number, y: number, width: number, height: number) {
        this.startX = x;
        this.startY = y;
        this.width = width;
        this.height = height;
    }

    getStartX () {
        return this.startX;
    }

    getStartY () {
        return this.startY;
    }

    getEndX () {
        return this.startX + this.width - 1;
    }

    getEndY () {
        return this.startY + this.height - 1;
    }

    getWidth () {
        return this.width;
    }

    getHeight () {
        return this.height;
    }
}

export class Renderer {
    display: Display;
    permanentLayers: Array<Layer>;
    temporaryLayers: Array<Layer>;
    renderSize: Position = new Position(0, 0, 120, 40);
    gameBoundaries: Position = new Position(0, 0, 80, 40);
    dialogBoundaries: Position = new Position(80, 0, 40, 40);
    fontSize: number = 20;

    constructor () {
        this.createNewDisplay();
        this.permanentLayers = new Array();
        this.temporaryLayers = new Array();
    }

    createNewDisplay () {
        delete this.display;
        this.display = new Display({width: this.renderSize.getWidth(), height: this.renderSize.getHeight(), fontSize: this.fontSize});
        document.body.appendChild(this.display.getContainer());
        this.display.getContainer().focus();
    }

    addPermanentLayer (layer: Layer) {
        this.permanentLayers.push(layer);
    }

    addTemporaryLayer (layer: Layer) {
        this.temporaryLayers.push(layer);
    }

    draw () {
        const sortedLayers = [
          ...this.permanentLayers, 
          ...this.temporaryLayers
        ].sort(
          (layerA, layerB) => layerA.index - layerB.index
        );
        sortedLayers.forEach(layer => {
            layer.draw(this.display);
            layer.reset();
        });
        this.temporaryLayers = new Array();
    }
}

export class Layer {
    index: number;
    drawables: Array<Drawable>;

    constructor (layerIdx: number) {
        this.index = layerIdx;
        this.reset();
    }

    reset () {
        this.drawables = new Array;
    }

    addDrawable (drawable: Drawable) {
        this.drawables.push(drawable);
    }

    draw (display: Display): void {
        for (const drawable of this.drawables) {
            drawable.draw(display);
        }
    }
}

abstract class Drawable {
    x: number;
    y: number;

    constructor (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    abstract draw(display: Display): void;
}

export class Text extends Drawable {
    textString: string | null;

    constructor(
        x: number,
        y: number,
        textString: string
    ) {
        super(x, y);
        this.textString = textString;
    }


    draw (display: Display): void {
        display.drawText(this.x, this.y, this.textString);
    }
}

export class Glyph extends Drawable{
    x: number;
    y: number;
    ch: string | null;
    fg: string | null;
    bg: string | null;
    drawOver: boolean;

    constructor (
        x: number,
        y: number,
        ch: string | null = null,
        foregroundColor: string | null = null,
        backgroundColor: string | null = null,
        drawOver: boolean = false
    ) {
        super(x, y);
        this.ch = ch;
        this.fg = foregroundColor;
        this.bg = backgroundColor;
        this.drawOver = drawOver;
    }

    draw (display: Display) {
        if (this.drawOver) {
            display.drawOver(this.x, this.y, this.ch, this.fg, this.bg);
        }
        else {
            display.draw(this.x, this.y, this.ch, this.fg, this.bg);
        }
    }
}
