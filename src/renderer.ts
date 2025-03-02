import { Display } from "rot-js";

export class Renderer {
    display: Display
    layers: Array<Layer>

    constructor (display: Display) {
        this.display = display;
        this.layers = new Array;
    }

    addLayer (layer: Layer) {
        this.layers.push(layer);
    }

    draw () {
        const sortedLayers = this.layers.sort((layerA, layerB) => layerA.index - layerB.index);
        sortedLayers.forEach(layer => {
            layer.draw(this.display);
            layer.reset();
        });
    }
}

export class Layer {
    index: number;
    board: Array<Array<Glyph>>;
    width: number;
    height: number;

    constructor (layerIdx: number, width: number, height: number) {
        this.index = layerIdx;
        this.width = width;
        this.height = height;
        this.reset();
    }

    reset() {
        this.board = new Array(this.height);
        for (let j = 0; j < this.height; j++) {
            this.board[j] = new Array(this.width);
        }
    }

    draw(display: Display): void {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (!this.board[j][i]) {
                    continue;
                }
                let symbol = this.board[j][i];
                display.draw(i, j, symbol.ch, symbol.fg, symbol.bg);
            }
        }
    }
}

export class Glyph {
    ch: string | string[] | null
    fg: string | null
    bg: string | null
    constructor (
        character: string | string[] | null,
        foregroundColor: string | null,
        backgroundColor: string | null
    ) {
        this.ch = character;
        this.fg = foregroundColor;
        this.bg = backgroundColor;
    }
}
