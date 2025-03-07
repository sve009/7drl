import { Display } from "rot-js";

export class Renderer {
  display: Display;
  renderSize: Position = new Position(0, 0, 105, 50);
  fontSize: number = 19;
  layers: Array<Layer> = new Array;

  constructor () {
    this.createNewDisplay();
  }

  createNewDisplay () {
    delete this.display;
    this.display = new Display({
      width: this.renderSize.getWidth(),
      height: this.renderSize.getHeight(),
      fontSize: this.fontSize
    });
    document.body.appendChild(this.display.getContainer());
    this.display.getContainer().focus();
  }


  draw () {
    const sortedLayers = this.layers.sort(
      (layerA, layerB) => layerA.index - layerB.index
    );
    sortedLayers.forEach(layer => {
      layer.draw(this.display);
    });
    this.layers = new Array();
  }

  addLayer (layer: Layer) {
    this.layers.push(layer);
  }
}

export class Position {
  startX: number;
  startY: number;
  width: number;
  height: number;

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


export class Layer {
  position: Position
  index: number;
  lazyDraw: boolean = true;
  cacheLayer:Array<Array<Drawable>>;
  drawables: Array<Drawable>;
  bg: string | null
  refresh: boolean = false

  constructor (layerIdx: number, position: Position, bg: string | null = null) {
    this.position = position;
    this.index = layerIdx;
    this.bg = bg;
    this.reset();
  }

  reset () {
    this.drawables = new Array;
    this.cacheLayer = new Array(this.position.getHeight());
    for (let i = 0; i < this.cacheLayer.length; i++) {
      this.cacheLayer[i] = new Array(this.position.getWidth());
    }
  }

  addDrawable (drawable: Drawable) {
    console.log(drawable)
    this.cacheLayer[drawable.y][drawable.x] = drawable;
    this.drawables.push(drawable);
  }

  draw (display: Display): void {
    if (this.lazyDraw) {
      if (this.refresh) {
        this.drawBackground(display);
        this.redrawAll(display);
        this.refresh = false;
      } else {
        this.drawables.forEach((drawable: Drawable) => drawable.draw(display, this.position.getStartX(), this.position.getStartY()));
        this.drawables = [];  
      }
    } else {
      this.drawBackground(display);
      this.drawables.forEach((drawable: Drawable) => drawable.draw(display, this.position.getStartX(), this.position.getStartY()));
      this.drawables = [];  
    }
  }

  drawBackground (display: Display): void {
    if (!this.bg) {
      return;
    }
    for (let i = 0; i < this.position.getWidth(); i++) {
      for (let j = 0; j < this.position.getHeight(); j++) {
        display.draw(i + this.position.startX, j + this.position.startY, null, null, this.bg);
      }
    }
  }

  redrawAll (display: Display): void {
    for (let i = 0; i < this.position.getHeight(); i++) {
      for (let j = 0; j < this.position.getWidth(); j++) {
        if (this.cacheLayer[i][j]) {
          this.cacheLayer[i][j].draw(display, this.position.getStartX(), this.position.getStartY());
        }
      }
    }
  }
}

export abstract class Drawable {
  x: number;
  y: number;

  constructor (x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract draw(display: Display, xOffset: number, yOffset: number): void;
}

export class TextDrawable extends Drawable {
  textString: string | null;
  maxWidth: number;

  constructor(
    x: number,
    y: number,
    textString: string,
    maxWidth: number = 0
  ) {
    super(x, y);
    this.textString = textString;
    this.maxWidth = maxWidth;
  }

  draw (display: Display, xOffset: number = 0, yOffset: number = 0): void {
    display.drawText(this.x + xOffset, this.y + yOffset, this.textString, this.maxWidth);
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

  draw (display: Display, xOffset: number = 0, yOffset: number = 0) {
    if (this.drawOver) {
      display.drawOver(this.x + xOffset, this.y + yOffset, this.ch, this.fg, this.bg);
    }
    else {
      display.draw(this.x + xOffset, this.y + yOffset, this.ch, this.fg, this.bg);
    }
  }
}

const renderer = new Renderer;
export function getRenderer(): Renderer {
  return renderer;
}

